
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { UserProfile } from './userService';

const usersCollection = 'users';

export const getWishlist = async (userId: string): Promise<string[]> => {
    const userDocRef = doc(db, usersCollection, userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
        const userData = docSnap.data() as UserProfile;
        return userData.wishlist || [];
    }
    return [];
};

export const addToWishlist = async (userId: string, productId: string): Promise<void> => {
    const userDocRef = doc(db, usersCollection, userId);
    await updateDoc(userDocRef, {
        wishlist: arrayUnion(productId)
    });
};

export const removeFromWishlist = async (userId: string, productId: string): Promise<void> => {
    const userDocRef = doc(db, usersCollection, userId);
    await updateDoc(userDocRef, {
        wishlist: arrayRemove(productId)
    });
};
