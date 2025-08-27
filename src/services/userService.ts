
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, DocumentData } from 'firebase/firestore';
import { ShippingAddress, CartItem } from '@/lib/types';

export interface UserProfile {
    name: string;
    email: string;
    phone: string;
    createdAt: number;
    addresses: ShippingAddress[];
    cart: CartItem[];
    wishlist: string[];
}

const usersCollection = 'users';

export const createUserProfile = async (userId: string, data: UserProfile): Promise<void> => {
    const userDocRef = doc(db, usersCollection, userId);
    await setDoc(userDocRef, data);
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const userDocRef = doc(db, usersCollection, userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    }
    return null;
}
