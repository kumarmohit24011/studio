
import { db } from '@/lib/firebase';
import { Order } from '@/lib/types';
import { collection, getDocs, doc, addDoc, query, where, orderBy, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

const orderCollection = collection(db, 'orders');

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Order => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        userId: data.userId,
        items: data.items,
        totalAmount: data.totalAmount,
        shippingAddress: data.shippingAddress,
        status: data.status,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_order_id: data.razorpay_order_id,
        createdAt: data.createdAt,
    };
}

export const createOrder = async (orderData: Omit<Order, 'id'>): Promise<string> => {
    const docRef = await addDoc(orderCollection, orderData);
    return docRef.id;
};

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
