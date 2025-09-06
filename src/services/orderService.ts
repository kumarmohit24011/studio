

import { db } from '@/lib/firebase';
import { Order } from '@/lib/types';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';

// This function creates an order in Firestore
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
        const orderCol = collection(db, 'orders');
        
        const dataToSave: any = {
            ...orderData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        // Firestore does not allow `undefined` values.
        // We'll clean the object before saving.
        if (dataToSave.couponCode === undefined) {
            delete dataToSave.couponCode;
        }
        if (dataToSave.discountAmount === undefined) {
            delete dataToSave.discountAmount;
        }

        await addDoc(orderCol, dataToSave);
    } catch (error) {
        console.error("Error creating order: ", error);
        throw error;
    }
};

// This function retrieves all orders for a specific user
export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
    try {
        const ordersRef = collection(db, 'orders');
        // Fetch orders by user ID
        const q = query(ordersRef, where("userId", "==", userId));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return [];
        }

        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

        // Sort orders by date client-side
        return orders.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

    } catch (error) {
        console.error("Error fetching orders for user: ", error);
        // In a real app, you might want to return an empty array or handle this differently
        return [];
    }
}

// This function retrieves all orders for the admin panel
export const getAllOrders = async (): Promise<Order[]> => {
    try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
        console.error("Error fetching all orders: ", error);
        return [];
    }
}

// This function updates the status of an order
export const updateOrderStatus = async (orderId: string, status: Order['orderStatus']): Promise<void> => {
    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            orderStatus: status,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating order status: ", error);
        throw error;
    }
};

