
import { db } from '@/lib/firebase';
import { Order, OrderItem } from '@/lib/types';
import { collection, getDocs, doc, addDoc, query, where, orderBy, DocumentData, QueryDocumentSnapshot, updateDoc, limit, getDoc, setDoc } from 'firebase/firestore';
import { Coupon } from './couponService';
import { getAuth } from 'firebase/auth';

const orderCollection = collection(db, 'orders');
const couponCollection = collection(db, 'coupons');

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Order => {
    const data = snapshot.data();
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
        createdAt: data.createdAt,
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
