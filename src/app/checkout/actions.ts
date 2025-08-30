
"use server";

import Razorpay from "razorpay";
import { z } from "zod";
import { getCouponByCode } from "@/services/orderService";
import { CartItem } from "@/lib/types";
import { Coupon } from "@/services/couponService";
import { db } from "@/lib/firebase";
import { doc, getDoc, runTransaction, setDoc } from "firebase/firestore";

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
    console.log("--- Starting saveOrder ---");
    console.log("Received paymentDetails:", JSON.stringify(paymentDetails));

    if (!paymentDetails.razorpay_order_id) {
        const errorMessage = "saveOrder failed: Missing razorpay_order_id.";
        console.error(errorMessage);
        return { success: false, message: errorMessage };
    }
    
    try {
        console.log("Step 1: Starting Firestore transaction for stock update.");
        await runTransaction(db, async (transaction) => {
            console.log("Inside transaction...");
            for (const item of cartItems) {
                const productRef = doc(db, 'products', item.id);
                console.log(`Processing product ${item.id} in transaction.`);
                const productDoc = await transaction.get(productRef);

                if (!productDoc.exists()) {
                    throw new Error(`Product with ID ${item.id} not found.`);
                }

                const currentStock = productDoc.data().stock;
                const newStock = currentStock - item.quantity;
                console.log(`Product ${item.id}: Current stock ${currentStock}, new stock ${newStock}`);

                if (newStock < 0) {
                    throw new Error(`Not enough stock for ${productDoc.data().name}. Only ${currentStock} left.`);
                }
                
                transaction.update(productRef, { stock: newStock });
                console.log(`Product ${item.id} stock update queued in transaction.`);
            }
             console.log("All stock updates queued successfully.");
        });
        console.log("Step 1: Firestore transaction for stock update completed successfully.");
        
        console.log("Step 2: Creating the order document in Firestore.");
        const orderDocRef = doc(db, 'orders', paymentDetails.razorpay_order_id);
        await setDoc(orderDocRef, {
             id: paymentDetails.razorpay_order_id,
            userId,
            items: cartItems.map(item => ({
                productId: item.id,
                name: item.name,
                image: item.images[0],
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount,
            shippingAddressId: shippingAddressId,
            orderStatus: 'Processing' as const,
            paymentStatus: 'Paid' as const,
            razorpay_payment_id: paymentDetails.razorpay_payment_id,
            razorpay_order_id: paymentDetails.razorpay_order_id,
            createdAt: Date.now(),
            coupon: couponApplied,
        });
        console.log(`Step 2: Order document ${paymentDetails.razorpay_order_id} created successfully.`);

        console.log("--- saveOrder successful ---");
        return { success: true, orderId: paymentDetails.razorpay_order_id };

    } catch (error) {
        console.error("--- ERROR in saveOrder process ---", error);
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
