
"use server";

import Razorpay from "razorpay";
import { z } from "zod";
import { createOrder as saveOrderInDb } from "@/services/orderService";
import { CartItem, ShippingAddress } from "@/lib/types";

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
    items: CartItem[],
    totalAmount: number,
    shippingAddress: ShippingAddress,
    paymentDetails: { razorpay_payment_id: string; razorpay_order_id: string }
) {
    try {
        const orderData = {
            userId,
            items,
            totalAmount,
            shippingAddress,
            status: 'Processing' as const,
            razorpay_payment_id: paymentDetails.razorpay_payment_id,
            razorpay_order_id: paymentDetails.razorpay_order_id,
            createdAt: Date.now()
        };
        const orderId = await saveOrderInDb(orderData);
        return { success: true, orderId };
    } catch (error) {
        console.error("Failed to save order:", error);
        return { success: false, message: "Failed to save the order to the database." };
    }
}
