
"use server";

import Razorpay from "razorpay";
import { z } from "zod";
import { CartItem } from "@/lib/types";
import { Coupon } from "@/services/couponService";
import { db } from "@/lib/firebase";
import { 
    doc, 
    runTransaction, 
    setDoc, 
    serverTimestamp 
} from "firebase/firestore";
import { getCouponByCode } from "@/services/orderService";
import { createLog } from "@/services/auditLogService";

// Use secure env vars (not NEXT_PUBLIC for server side)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const RazorpayOrderInput = z.number().positive();

/**
 * Create a Razorpay order
 */
export async function createRazorpayOrder(amount: number) {
    const validationResult = RazorpayOrderInput.safeParse(amount);
    if (!validationResult.success) {
        throw new Error("Invalid amount provided");
    }

    const options = {
        amount: Math.round(amount * 100), // convert to paise
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        if (!order) throw new Error("Razorpay order creation failed.");
        return order;
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        throw new Error("Failed to create Razorpay order.");
    }
}

/**
 * Save order to Firestore
 */
export async function saveOrder(
    userId: string,
    userName: string,
    cartItems: CartItem[],
    totalAmount: number,
    shippingAddressId: string,
    paymentDetails: { razorpay_payment_id: string; razorpay_order_id: string },
    couponApplied?: { code: string; discountAmount: number }
) {
    console.log("--- Starting saveOrder ---", { userId, totalAmount, orderId: paymentDetails.razorpay_order_id });

    if (!paymentDetails.razorpay_order_id) {
        console.error("saveOrder failed: Missing razorpay_order_id.");
        return { success: false, message: "Missing razorpay_order_id." };
    }
     if (!userId) {
        console.error("saveOrder failed: Missing userId.");
        return { success: false, message: "User not authenticated." };
    }

    try {
        await runTransaction(db, async (transaction) => {
            for (const item of cartItems) {
                const productRef = doc(db, "products", item.id);
                const productDoc = await transaction.get(productRef);

                if (!productDoc.exists()) {
                    throw new Error(`Product with ID ${item.id} not found.`);
                }

                const currentStock = productDoc.data().stock;
                const newStock = currentStock - item.quantity;

                if (newStock < 0) {
                    throw new Error(`Not enough stock for ${productDoc.data().name}. Only ${currentStock} left.`);
                }
                transaction.update(productRef, { stock: newStock });
            }
        });

        const orderId = paymentDetails.razorpay_order_id;
        const orderDocRef = doc(db, "orders", orderId);

        const orderItems = cartItems.map(item => ({
            productId: item.id,
            name: item.name,
            image: item.images?.[0] || null,
            quantity: item.quantity,
            price: item.price,
        }));

        await setDoc(orderDocRef, {
            userId,
            items: orderItems,
            totalAmount,
            shippingAddressId,
            orderStatus: "Processing" as const,
            paymentStatus: "Paid" as const,
            razorpay_payment_id: paymentDetails.razorpay_payment_id,
            razorpay_order_id: paymentDetails.razorpay_order_id,
            createdAt: serverTimestamp(),
            coupon: couponApplied || null,
        });
        
        await createLog({
            action: "CREATE",
            entityType: "ORDER",
            entityId: orderId,
            details: `Order of ₹${totalAmount.toFixed(2)} was placed.`,
            userId: userId,
            userName: userName || "Customer",
        });


        console.log("--- Order document created successfully ---");
        return { success: true, orderId };

    } catch (error) {
        console.error("--- Error in saveOrder process ---", error);
        const errorMessage = error instanceof Error ? error.message : "Unexpected error while saving the order.";
        // Potentially reverse payment here or flag for manual check
        return { success: false, message: errorMessage };
    }
}

/**
 * Apply coupon code
 */
export async function applyCouponCode(code: string, subtotal: number): Promise<{
    success: boolean;
    coupon?: Coupon;
    discountAmount?: number;
    message: string;
}> {
    const coupon = await getCouponByCode(code);

    if (!coupon) {
        return { success: false, message: "Invalid coupon code." };
    }

    if (!coupon.isActive) {
        return { success: false, message: "This coupon is no longer active." };
    }
    
    if (Date.now() > coupon.expiryDate) {
        return { success: false, message: "This coupon has expired." };
    }

    if (subtotal < coupon.minPurchase) {
        return { success: false, message: `You must spend at least ₹${coupon.minPurchase} to use this coupon.` };
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
        discountAmount = (subtotal * coupon.discountValue) / 100;
    } else {
        discountAmount = coupon.discountValue;
    }

    return {
        success: true,
        coupon,
        discountAmount,
        message: "Coupon applied successfully.",
    };
}
