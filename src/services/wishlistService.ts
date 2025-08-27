
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, DocumentData } from 'firebase/firestore';

const wishlistCollectionName = 'wishlists';

export const getWishlist = async (userId: string): Promise<string[]> => {
    const wishlistDocRef = doc(db, wishlistCollectionName, userId);
    const docSnap = await getDoc(wishlistDocRef);
    if (docSnap.exists()) {
        return (docSnap.data() as DocumentData).productIds as string[] || [];
    }
    return [];
};

export const addToWishlist = async (userId: string, productId: string): Promise<void> => {
    const wishlistDocRef = doc(db, wishlistCollectionName, userId);
    const docSnap = await getDoc(wishlistDocRef);

    if (!docSnap.exists()) {
        await setDoc(wishlistDocRef, { productIds: [productId] });
    } else {
        await updateDoc(wishlistDocRef, {
            productIds: arrayUnion(productId)
        });
    }
};

export const removeFromWishlist = async (userId: string, productId: string): Promise<void> => {
    const wishlistDocRef = doc(db, wishlistCollectionName, userId);
    const docSnap = await getDoc(wishlistDocRef);

    if (docSnap.exists()) {
        await updateDoc(wishlistDocRef, {
            productIds: arrayRemove(productId)
        });
    }
};
