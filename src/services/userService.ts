

import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, DocumentData, collection, getDocs, QueryDocumentSnapshot, updateDoc } from 'firebase/firestore';
import { ShippingAddress } from '@/lib/types';
import { User, getAuth } from 'firebase/auth';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: number;
    addresses: ShippingAddress[];
    isActive: boolean;
    isAdmin: boolean;
    cart?: any[];
    wishlist?: string[];
}

const usersCollection = collection(db, 'users');

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): UserProfile => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        createdAt: data.createdAt,
        addresses: data.addresses || [],
        isActive: data.isActive !== false, // default to true if not set
        isAdmin: data.isAdmin === true, // default to false,
        cart: data.cart || [],
        wishlist: data.wishlist || []
    };
}

export const createUserProfile = async (user: User): Promise<void> => {
    const userDocRef = doc(db, 'users', user.uid);
    const userProfile : Omit<UserProfile, 'id'> = {
        name: user.displayName || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        createdAt: Date.now(),
        addresses: [],
        isActive: true,
        isAdmin: false, // New users are not admins by default
    }
    await setDoc(userDocRef, userProfile);
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            createdAt: data.createdAt,
            addresses: data.addresses || [],
            isActive: data.isActive !== false,
            isAdmin: data.isAdmin === true,
            cart: data.cart || [],
            wishlist: data.wishlist || []
        } as UserProfile;
    }
    return null;
}

export const getAllUsers = async (): Promise<UserProfile[]> => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Authentication required.");

    const profile = await getUserProfile(currentUser.uid);
    if (!profile?.isAdmin) throw new Error("Admin privileges required.");

    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map(fromFirestore);
};

export const toggleUserStatus = async (userId: string, currentStatus: boolean): Promise<void> => {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { isActive: !currentStatus });
};

export const toggleAdminStatus = async (userId: string, currentStatus: boolean): Promise<void> => {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { isAdmin: !currentStatus });
}
