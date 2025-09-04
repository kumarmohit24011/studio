
import { db } from '@/lib/firebase';
import { UserProfile } from '@/lib/types';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

export const createUserProfile = async (uid: string, email: string, name: string, photoURL?: string): Promise<void> => {
    try {
        const userRef = doc(db, 'users', uid);
        const userProfile: UserProfile = {
            uid,
            email,
            name,
            photoURL: photoURL || '',
            createdAt: serverTimestamp(),
            wishlist: [],
            cart: [],
            isAdmin: false, // Default to not admin
        };
        await setDoc(userRef, userProfile);
    } catch (error) {
        console.error("Error creating user profile:", error);
        throw error;
    }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
        const userRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting user profile:", error);
        return null;
    }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, data);
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};
