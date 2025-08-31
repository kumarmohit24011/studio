
"use server";

import { adminDb } from '@/lib/firebase-admin';
import type { Order, OrderItem, CartItem } from '@/lib/types';
import { collection, getDocs, doc, query, where, orderBy, DocumentData, QueryDocumentSnapshot, updateDoc, limit, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Coupon } from './couponService';
import { z } from "zod";
import * as admin from 'firebase-admin';


const orderCollectionRef = collection(db, 'orders');
const couponCollectionRef = collection(db, 'coupons');

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Order => {
    const data = snapshot.data();
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

export async function getOrdersForUser(userId: string): Promise<Order[]> {
    const q = query(orderCollectionRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(fromFirestore);
}

export async function getAllOrders(): Promise<Order[]> {
    const q = query(orderCollectionRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(fromFirestore);
}

export async function updateOrderStatus(orderId: string, status: Order['orderStatus']): Promise<void> {
    const orderDoc = doc(db, 'orders', orderId);
    await updateDoc(orderDoc, { orderStatus: status });
};

export async function getCouponByCode(code: string): Promise<Coupon | null> {
    const q = query(couponCollectionRef, where("code", "==", code), limit(1));
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

export async function saveOrder(
    input: any
): Promise<{ success: boolean; message: string; orderId?: string; }> {
    console.log("[SERVER_ACTION] saveOrder called with input:", JSON.stringify(input, null, 2));

    if (!adminDb) {
        const errorMsg = "Firebase Admin SDK is not initialized. Cannot save order.";
        console.error(`[SERVER_ERROR] ${errorMsg}`);
        return { success: false, message: errorMsg };
    }
    
    // We assume validation happens in the calling action file.
    const { 
        userId, 
        cartItems, 
        totalAmount, 
        shippingAddressId, 
        paymentDetails, 
        couponDetails 
    } = input;

    try {
        const newOrderRef = adminDb.collection("orders").doc();

        const newOrderData = {
            userId,
            items: cartItems.map((item: CartItem) => ({
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
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        console.log("[SERVER_ACTION] Writing validated order data to Firestore with Admin SDK.");
        await newOrderRef.set(newOrderData);
        
        console.log(`[SERVER_ACTION] Order ${newOrderRef.id} saved successfully.`);
        return { success: true, message: "Order saved successfully.", orderId: newOrderRef.id };

    } catch (error: any) {
        console.error("[SERVER_ERROR] CRITICAL: FAILED TO SAVE ORDER TO FIRESTORE WITH ADMIN SDK", {
            message: error.message,
            stack: error.stack,
        });
        return { success: false, message: error.message || "A critical server error occurred while saving the order." };
    }
}
