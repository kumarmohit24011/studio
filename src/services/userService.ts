
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, DocumentData, collection, getDocs, QueryDocumentSnapshot } from 'firebase/firestore';
import { ShippingAddress, CartItem } from '@/lib/types';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: number;
    addresses: ShippingAddress[];
    isActive?: boolean;
}

const usersCollection = collection(db, 'users');

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): UserProfile => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        createdAt: data.createdAt,
        addresses: data.addresses || [],
        isActive: data.isActive !== false, // default to true if not set
    };
}


export const createUserProfile = async (userId: string, data: Omit<UserProfile, 'isActive'>): Promise<void> => {
    const userDocRef = doc(db, 'users', userId);
    // When creating, set isActive to true by default.
    await setDoc(userDocRef, {...data, isActive: true});
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
        return fromFirestore(docSnap as QueryDocumentSnapshot<DocumentData>);
    }
    return null;
}

export const getAllUsers = async (): Promise<UserProfile[]> => {
    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map(fromFirestore);
};
