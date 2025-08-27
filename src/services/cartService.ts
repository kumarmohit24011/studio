
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { CartItem } from '@/lib/types';
import { UserProfile } from './userService';

const usersCollection = 'users';

export const getCart = async (userId: string): Promise<CartItem[]> => {
    const userDocRef = doc(db, usersCollection, userId);
    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            const userData = docSnap.data() as UserProfile;
            return userData.cart || [];
        }
    } catch (error) {
        console.error("Error fetching cart from user profile:", error);
    }
    return [];
};

export const updateCart = async (userId: string, items: CartItem[]): Promise<void> => {
    const userDocRef = doc(db, usersCollection, userId);
    // Use updateDoc to avoid overwriting the whole user document
    await updateDoc(userDocRef, { cart: items });
};
