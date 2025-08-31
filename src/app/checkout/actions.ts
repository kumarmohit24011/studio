
"use server";

import Razorpay from "razorpay";
import { z } from "zod";
import { CartItem } from "@/lib/types";
import { Coupon } from "@/services/couponService";
import { db } from "@/lib/firebase";
import { doc, getDoc, runTransaction, setDoc, collection, writeBatch } from "firebase/firestore";
import { getCouponByCode } from "@/services/orderService";

const RazorpayOrderInput = z.number().positive();

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createRazorpayOrder(amount: number) {
    const validationResult = RazorpayOrderInput.safeParse(amount);
    if (!validationResult.success) {
        throw new Error("Invalid amount provided");
    }

    const options = {
        amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
        currency: "INR",
        receipt: `receipt_order_${new Date().getTime()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        if (!order) {
            throw new Error("Razorpay order creation failed.");
        }
        return order;
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        throw new Error("Failed to create Razorpay order.");
    }
}

export async function saveOrder(
    userId: string,
    cartItems: CartItem[],
    totalAmount: number,
    shippingAddressId: string,
    paymentDetails: { razorpay_payment_id: string; razorpay_order_id: string },
    couponApplied?: { code: string; discountAmount: number }
) {
    console.log("--- Starting saveOrder ---", { userId, totalAmount, orderId: paymentDetails.razorpay_order_id });
    if (!paymentDetails.razorpay_order_id) {
        console.error("saveOrder failed: Missing razorpay_order_id.");
        return { success: false, message: "saveOrder failed: Missing razorpay_order_id." };
    }
    
    try {
        // Step 1: Update stock levels within a transaction for atomicity.
        console.log("--- Running stock update transaction ---");
        await runTransaction(db, async (transaction) => {
            for (const item of cartItems) {
                const productRef = doc(db, 'products', item.id);
                const productDoc = await transaction.get(productRef);

                if (!productDoc.exists()) {
                    throw new Error(`Product with ID ${item.id} not found.`);
                }

                const currentStock = productDoc.data().stock;
                const newStock = currentStock - item.quantity;

                if (newStock < 0) {
                    throw new Error(`Not enough stock for ${productDoc.data().name}. Only ${currentStock} left.`);
                }
                
                console.log(`Updating stock for ${item.name} from ${currentStock} to ${newStock}`);
                transaction.update(productRef, { stock: newStock });
            }
        });
        console.log("--- Stock update transaction successful ---");
        
        // Step 2: Create the order document after the transaction is successful.
        const orderId = paymentDetails.razorpay_order_id;
        const orderDocRef = doc(db, 'orders', orderId);
        
        console.log(`--- Creating order document with ID: ${orderId} ---`);

        const orderItems = cartItems.map(item => ({
            productId: item.id,
            name: item.name,
            image: item.images[0], // Assuming the first image is the primary one
            quantity: item.quantity,
            price: item.price
        }));

        await setDoc(orderDocRef, {
            userId,
            items: orderItems,
            totalAmount,
            shippingAddressId: shippingAddressId,
            orderStatus: 'Processing' as const,
            paymentStatus: 'Paid' as const,
            razorpay_payment_id: paymentDetails.razorpay_payment_id,
            razorpay_order_id: paymentDetails.razorpay_order_id,
            createdAt: Date.now(),
            coupon: couponApplied,
        });

        console.log("--- Order document created successfully ---");
        return { success: true, orderId: orderId };

    } catch (error) {
        console.error("--- Error in saveOrder process ---", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to save the order due to an unexpected error.";
        return { success: false, message: errorMessage };
    }
}


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

    if (new Date().getTime() > coupon.expiryDate) {
        return { success: false, message: "This coupon has expired." };
    }

    if (subtotal < coupon.minPurchase) {
        return { success: false, message: `You must spend at least ₹${coupon.minPurchase} to use this coupon.` };
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
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
