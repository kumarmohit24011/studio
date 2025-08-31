
import { db } from '@/lib/firebase';
import { Order, OrderItem } from '@/lib/types';
import { collection, getDocs, doc, addDoc, query, where, orderBy, DocumentData, QueryDocumentSnapshot, updateDoc, limit, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Coupon } from './couponService';
import { getAuth } from 'firebase/auth';
import { z } from "zod";
import type { CartItem } from "@/lib/types";

const orderCollection = collection(db, 'orders');
const couponCollection = collection(db, 'coupons');

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Order => {
    const data = snapshot.data();
    // Fallback for timestamp format differences
    const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt;
    return {
        id: snapshot.id,
        userId: data.userId,
        items: data.items.map((item: any): OrderItem => ({
            productId: item.productId,
            name: item.name,
            image: item.image,
            quantity: item.quantity,
            price: item.price,
        })),
        totalAmount: data.totalAmount,
        shippingAddressId: data.shippingAddressId,
        orderStatus: data.orderStatus,
        paymentStatus: data.paymentStatus,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_order_id: data.razorpay_order_id,
        createdAt: createdAt,
        coupon: data.coupon
    };
}

const getCurrentUser = () => {
    const auth = getAuth();
    return auth.currentUser;
}

export const getOrdersForUser = async (userId: string): Promise<Order[]> => {
    const q = query(orderCollection, where("userId", "==", userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(fromFirestore);
}

export const getAllOrders = async (): Promise<Order[]> => {
    const q = query(orderCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(fromFirestore);
}

export const updateOrderStatus = async (orderId: string, status: Order['orderStatus']): Promise<void> => {
    const orderDoc = doc(db, 'orders', orderId);
    await updateDoc(orderDoc, { orderStatus: status });
};

export const getCouponByCode = async (code: string): Promise<Coupon | null> => {
    const q = query(couponCollection, where("code", "==", code), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null;
    }

    const couponDoc = snapshot.docs[0];
    const data = couponDoc.data();

    return {
        id: couponDoc.id,
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        expiryDate: data.expiryDate,
        minPurchase: data.minPurchase,
        isActive: data.isActive,
    };
};

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

export const SaveOrderInputSchema = z.object({
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

        // Using setDoc on the new reference to ensure the ID is set correctly.
        await setDoc(newOrderRef, newOrderData);
        
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
