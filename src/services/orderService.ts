
import { db } from '@/lib/firebase';
import { Order } from '@/lib/types';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

// This function creates an order in Firestore
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> & { razorpayPaymentId: string }) => {
    try {
        const orderCol = collection(db, 'orders');
        await addDoc(orderCol, {
            ...orderData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error creating order: ", error);
        throw error;
    }
};

// This function retrieves all orders for a specific user
export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
    try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where("userId", "==", userId));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order))
               .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds); // Sort by most recent
    } catch (error) {
        console.error("Error fetching orders for user: ", error);
        throw error;
    }
}
