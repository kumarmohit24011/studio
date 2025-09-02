
"use server";

import Razorpay from "razorpay";
import { z } from "zod";
import { 
    getCouponByCode
} from "@/services/orderService";
import type { Coupon } from "@/services/couponService";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import type { CartItem } from "@/lib/types";

const RazorpayOrderInput = z.number().positive();


export async function createRazorpayOrder(amount: number): Promise<{ id: string; currency: string; amount: number; }> {
    const validationResult = RazorpayOrderInput.safeParse(amount);
    if (!validationResult.success) {
        throw new Error("Invalid amount provided");
    }

    const razorpay = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

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
        console.error("[SERVER_ERROR] createRazorpayOrder:", error);
        throw new Error("Failed to create Razorpay order.");
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

interface SaveOrderInput {
    userId: string;
    cartItems: CartItem[];
    totalAmount: number;
    shippingAddressId: string;
    paymentDetails: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
    };
    couponDetails?: {
        code: string;
        discountAmount: number;
    };
}

export async function saveOrder(input: SaveOrderInput) {
    try {
        const { userId, cartItems, totalAmount, shippingAddressId, paymentDetails, couponDetails } = input;
        
        const newOrderRef = doc(db, "orders", paymentDetails.razorpay_order_id);

        const orderData = {
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
            shippingAddressId,
            orderStatus: 'Processing',
            paymentStatus: 'Paid',
            razorpay_payment_id: paymentDetails.razorpay_payment_id,
            razorpay_order_id: paymentDetails.razorpay_order_id,
            coupon: couponDetails || null,
            createdAt: Date.now(),
        };

        await setDoc(newOrderRef, orderData);

        return { success: true, orderId: newOrderRef.id };
    } catch (error) {
        console.error("Error saving order:", error);
        return { success: false, message: "Failed to save order." };
    }
}
