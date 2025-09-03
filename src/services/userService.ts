

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

const usersCollectionRef = db ? collection(db, 'users') : null;

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
    if (!db) throw new Error("Database not initialized");
    const userDocRef = doc(db, 'users', user.uid);
    
    const finalName = name || user.displayName || 'New User';
    
    // Update auth profile if a name was provided (e.g. from sign up form)
    if (name && auth.currentUser && auth.currentUser.displayName !== name) {
        await firebaseUpdateProfile(auth.currentUser, { displayName: name });
    }

    // Check if the user is the designated admin by email
    const isAdmin = user.email === 'admin@rebow.com';

    const newUserProfile: Omit<UserProfile, 'id'> = {
        name: finalName,
        email: user.email || '',
        phone: user.phoneNumber || '',
        createdAt: Date.now(),
        addresses: [],
        isActive: true,
        isAdmin: isAdmin, 
        cart: [],
        wishlist: []
    }
    await setDoc(userDocRef, newUserProfile, { merge: true }); // Use merge to not overwrite existing fields on re-login
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
    if (!auth?.currentUser) throw new Error("Authentication required.");
    if (!usersCollectionRef) return [];

    const profile = await getUserProfile(auth.currentUser.uid);
    if (!profile?.isAdmin) {
        throw new Error("Admin privileges required.");
    }

    const snapshot = await getDocs(usersCollectionRef);
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
    
    // Update the auth profile
    if (user) {
        await firebaseUpdateProfile(user, {
            displayName: data.displayName
        });
    }

    // Update the Firestore profile document
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
        name: data.displayName,
        phone: data.phoneNumber
    });
}
