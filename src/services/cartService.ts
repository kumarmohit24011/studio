
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, DocumentData } from 'firebase/firestore';
import { CartItem } from '@/lib/types';

const cartCollectionName = 'carts';

export const getCart = async (userId: string): Promise<CartItem[]> => {
    const cartDocRef = doc(db, cartCollectionName, userId);
    const docSnap = await getDoc(cartDocRef);
    if (docSnap.exists()) {
        return (docSnap.data() as DocumentData).items as CartItem[];
    }
    return [];
};

export const updateCart = async (userId: string, items: CartItem[]): Promise<void> => {
    const cartDocRef = doc(db, cartCollectionName, userId);
    await setDoc(cartDocRef, { items });
};

export const addItemToCart = async (userId: string, item: CartItem): Promise<void> => {
    const cartDocRef = doc(db, cartCollectionName, userId);
    const docSnap = await getDoc(cartDocRef);

    if (!docSnap.exists()) {
        await setDoc(cartDocRef, { items: [item] });
        return;
    }

    const items = (docSnap.data() as DocumentData).items as CartItem[];
    const existingItemIndex = items.findIndex(i => i.id === item.id);

    if (existingItemIndex > -1) {
        // Item exists, update its quantity
        items[existingItemIndex].quantity += item.quantity;
        await updateDoc(cartDocRef, { items });
    } else {
        // Item does not exist, add it
        await updateDoc(cartDocRef, {
            items: arrayUnion(item)
        });
    }
};

export const removeItemFromCart = async (userId: string, itemId: string): Promise<void> => {
    const cartDocRef = doc(db, cartCollectionName, userId);
    const docSnap = await getDoc(cartDocRef);

    if (docSnap.exists()) {
        const items = (docSnap.data() as DocumentData).items as CartItem[];
        const updatedItems = items.filter(i => i.id !== itemId);
        await updateDoc(cartDocRef, { items: updatedItems });
    }
};

export const updateItemQuantity = async (userId: string, itemId: string, quantity: number): Promise<void> => {
     const cartDocRef = doc(db, cartCollectionName, userId);
    const docSnap = await getDoc(cartDocRef);

    if (docSnap.exists()) {
        const items = (docSnap.data() as DocumentData).items as CartItem[];
        const itemIndex = items.findIndex(i => i.id === itemId);

        if (itemIndex > -1) {
            if (quantity <= 0) {
                 await removeItemFromCart(userId, itemId);
            } else {
                items[itemIndex].quantity = quantity;
                await updateDoc(cartDocRef, { items });
            }
        }
    }
}
