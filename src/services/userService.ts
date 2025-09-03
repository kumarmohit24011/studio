
import { db } from '@/lib/firebase';
import { UserProfile } from '@/lib/types';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const createUserProfile = async (userProfile: UserProfile): Promise<void> => {
    const userRef = doc(db, 'users', userProfile.uid);
    await setDoc(userRef, userProfile);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    } else {
        return null;
    }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, data, { merge: true });
};
