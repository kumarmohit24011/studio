
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
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
    // Use setDoc with merge: true to avoid errors on first login
    await setDoc(userDocRef, {
        wishlist: arrayUnion(productId)
    }, { merge: true });
};

export const removeFromWishlist = async (userId: string, productId: string): Promise<void> => {
    const userDocRef = doc(db, usersCollection, userId);
    // updateDoc is safe here because an item can't be in the wishlist if the doc doesn't exist.
    await updateDoc(userDocRef, {
        wishlist: arrayRemove(productId)
    });
};
