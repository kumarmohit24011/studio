

import { db, auth } from '@/lib/firebase';
import { doc, setDoc, getDoc, DocumentData, collection, getDocs, QueryDocumentSnapshot, updateDoc } from 'firebase/firestore';
import { ShippingAddress } from '@/lib/types';
import { User, updateProfile as firebaseUpdateProfile } from 'firebase/auth';

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

const usersCollection = db ? collection(db, 'users') : null;

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): UserProfile => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        createdAt: data.createdAt,
        addresses: data.addresses || [],
        isActive: data.isActive !== false,
        isAdmin: data.isAdmin === true,
        cart: data.cart || [],
        wishlist: data.wishlist || []
    };
}

export const createUserProfile = async (user: User, name?: string): Promise<void> => {
    if (!db || !auth) throw new Error("Database not initialized");
    const userDocRef = doc(db, 'users', user.uid);
    
    // If a name is provided (from email signup form), update the auth profile first.
    if (name && auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, { displayName: name });
    }

    const finalName = name || user.displayName || '';

    // Check if the user is the designated admin.
    const isAdmin = user.email === 'admin@rebow.com';

    const userProfile : Omit<UserProfile, 'id'> = {
        name: finalName,
        email: user.email || '',
        phone: user.phoneNumber || '',
        createdAt: Date.now(),
        addresses: [],
        isActive: true,
        isAdmin: isAdmin, 
    }
    await setDoc(userDocRef, userProfile);
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    if (!db) return null;
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
    if (!auth) throw new Error("Authentication not initialized.");
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Authentication required.");
    if (!usersCollection) return [];

    const profile = await getUserProfile(currentUser.uid);
    if (!profile?.isAdmin) {
        throw new Error("Admin privileges required.");
    }

    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map(fromFirestore);
};

export const toggleUserStatus = async (userId: string, currentStatus: boolean): Promise<void> => {
    if (!db) throw new Error("Database not initialized");
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { isActive: !currentStatus });
};

export const toggleAdminStatus = async (userId: string, currentStatus: boolean): Promise<void> => {
    if (!db) throw new Error("Database not initialized");
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { isAdmin: !currentStatus });
}

export const updateProfile = async (user: User, data: {displayName?: string, phoneNumber?: string}) => {
    if (!db || !auth) throw new Error("Database not initialized");
    
    await firebaseUpdateProfile(user, {
        displayName: data.displayName
    });

    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
        name: data.displayName,
        phone: data.phoneNumber
    });
}
