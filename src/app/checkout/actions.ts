
"use server";

import Razorpay from "razorpay";
import { z } from "zod";
import { createOrder as saveOrderInDb, getCouponByCode } from "@/services/orderService";
import { CartItem } from "@/lib/types";
import { Coupon } from "@/services/couponService";
import { db } from "@/lib/firebase";
import { doc, getDoc, writeBatch, runTransaction } from "firebase/firestore";
import { Product } from "@/lib/placeholder-data";

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
     if (!paymentDetails.razorpay_order_id) {
        return { success: false, message: "Razorpay Order ID is missing." };
    }
    
    try {
       const orderId = await saveOrderInDb({
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
        
        return { success: true, orderId: orderId };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to save the order.";
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
