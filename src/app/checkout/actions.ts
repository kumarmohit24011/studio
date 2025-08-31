
"use server";

import Razorpay from "razorpay";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, serverTimestamp, addDoc, doc, getDoc, runTransaction } from "firebase/firestore";
import { getCouponByCode } from "@/services/orderService";
import type { CartItem } from "@/lib/types";
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

// --- ZOD Schemas for robust validation ---
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

const SaveOrderInputSchema = z.object({
    userId: z.string(),
    cartItems: z.array(CartItemSchema),
    totalAmount: z.number(),
    shippingAddressId: z.string(),
    paymentDetails: PaymentDetailsSchema,
    couponDetails: CouponDetailsSchema,
});


export async function saveOrder(
    input: z.infer<typeof SaveOrderInputSchema>
): Promise<{ success: boolean; message: string; orderId?: string; }> {
    console.log("[SERVER] Received raw input for saveOrder:", input);
    
    const validation = SaveOrderInputSchema.safeParse(input);
    if (!validation.success) {
        console.error("[SERVER_ERROR] SaveOrder validation failed:", validation.error.flatten());
        return { success: false, message: `Invalid order data provided. ${validation.error.message}` };
    }
    
    const { 
        userId, 
        cartItems, 
        totalAmount, 
        shippingAddressId, 
        paymentDetails, 
        couponDetails 
    } = validation.data;

    try {
        const newOrderRef = doc(collection(db, "orders"));

        const newOrderData = {
            id: newOrderRef.id,
            userId,
            items: cartItems.map(item => ({
                productId: item.id,
                name: item.name,
                image: item.images[0],
                quantity: item.quantity,
                price: item.price,
            })),
            totalAmount,
            shippingAddressId,
            orderStatus: 'Processing',
            paymentStatus: 'Paid',
            razorpay_payment_id: paymentDetails.razorpay_payment_id,
            razorpay_order_id: paymentDetails.razorpay_order_id,
            coupon: couponDetails || null,
            createdAt: serverTimestamp(),
        };

        console.log("[SERVER] Prepared validated order data for Firestore:", JSON.stringify(newOrderData, null, 2));

        await addDoc(collection(db, "orders"), newOrderData);
        
        console.log(`[SERVER] Order ${newOrderRef.id} saved successfully.`);
        return { success: true, message: "Order saved successfully.", orderId: newOrderRef.id };

    } catch (error: any) {
        console.error("[SERVER_ERROR] CRITICAL: FAILED TO SAVE ORDER TO FIRESTORE", {
            code: error.code,
            message: error.message,
            stack: error.stack,
        });
        return { success: false, message: error.message || "A critical server error occurred while saving the order." };
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
