
"use server";

import Razorpay from "razorpay";
import { z } from "zod";
import { 
    saveOrder as saveOrderToDb, 
    getCouponByCode
} from "@/services/orderService";
import type { Coupon } from "@/services/couponService";

const RazorpayOrderInput = z.number().positive();

export async function createRazorpayOrder(amount: number) {
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

const CartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  images: z.array(z.string().url()).min(1),
  price: z.number(),
  quantity: z.number().positive(),
  category: z.string(),
  sku: z.string(),
  stock: z.number(),
  tags: z.array(z.string()).optional(),
});

const PaymentDetailsSchema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_order_id: z.string(),
});

const CouponDetailsSchema = z.object({
  code: z.string(),
  discountAmount: z.number(),
}).optional();

export const SaveOrderInputSchema = z.object({
    userId: z.string(),
    cartItems: z.array(CartItemSchema),
    totalAmount: z.number(),
    shippingAddressId: z.string(),
    paymentDetails: PaymentDetailsSchema,
    couponDetails: CouponDetailsSchema,
});


// This is now just a clean wrapper around the centralized service function.
export async function saveOrder(
    input: z.infer<typeof SaveOrderInputSchema>
): Promise<{ success: boolean; message: string; orderId?: string; }> {
    return saveOrderToDb(input);
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
