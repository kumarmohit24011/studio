
"use server";

import type { Order, OrderItem, CartItem } from '@/lib/types';
import { collection, getDocs, doc, query, where, orderBy, DocumentData, QueryDocumentSnapshot, updateDoc, limit, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Coupon } from './couponService';


const orderCollectionRef = db ? collection(db, 'orders') : null;
const couponCollectionRef = db ? collection(db, 'coupons') : null;

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Order => {
    const data = snapshot.data();
    // Handle both server-generated Timestamps and client-side numbers
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
    if (!orderCollectionRef) return [];
    const q = query(orderCollectionRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(fromFirestore);
}

export async function getAllOrders(): Promise<Order[]> {
    if (!orderCollectionRef) return [];
    const q = query(orderCollectionRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(fromFirestore);
}

export async function updateOrderStatus(orderId: string, status: Order['orderStatus']): Promise<void> {
    if (!db) throw new Error("Database not initialized");
    const orderDoc = doc(db, 'orders', orderId);
    await updateDoc(orderDoc, { orderStatus: status });
};

export async function getCouponByCode(code: string): Promise<Coupon | null> {
    if (!couponCollectionRef) return null;
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
