
import { db } from '@/lib/firebase';
import { UserProfile, Address } from '@/lib/types';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

export const createUserProfile = async (uid: string, email: string, name: string, photoURL?: string): Promise<UserProfile> => {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        console.log(`Profile for user ${uid} already exists.`);
        return docSnap.data() as UserProfile;
    }

    const isAdmin = email === 'admin@redbow.com';

    const userProfile: UserProfile = {
        uid,
        email,
        name,
        photoURL: photoURL || '',
        createdAt: serverTimestamp(),
        wishlist: [],
        cart: [],
        isAdmin,
    };
    
    try {
        await setDoc(userRef, userProfile);
        // We can't return userProfile directly because createdAt is a serverTimestamp
        // A full-fledged solution might re-fetch, but for our case, this is sufficient for the client state
        const profile = await getUserProfile(uid);
        return profile!;

    } catch (error) {
        console.error("Error creating user profile:", error);
        throw error;
    }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    if (!db) {
        console.error("Firestore not initialized");
        return null;
    }
    try {
        const userRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        } else {
            console.warn(`No profile found for user ${uid}`);
            return null;
        }
    } catch (error) {
        console.error("Error getting user profile:", error);
        return null;
    }
};

export const updateUserProfile = async (uid: string, data: { name?: string; phone?: string; address?: Partial<Address> }): Promise<void> => {
    if (!db) {
        console.error("Firestore not initialized");
        return;
    }
    try {
        const userRef = doc(db, 'users', uid);
        
        // To update nested address fields, we need to use dot notation
        const updateData: { [key: string]: any } = {};
        if (data.name) updateData.name = data.name;
        if (data.phone) updateData.phone = data.phone;
        if (data.address) {
            Object.entries(data.address).forEach(([key, value]) => {
                if(value !== undefined) {
                    updateData[`address.${key}`] = value;
                }
            });
        }
        
        await updateDoc(userRef, updateData);
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};
