
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, DocumentData } from 'firebase/firestore';

export interface HomepageSettings {
  heroImageUrl: string;
}

const settingsCollectionName = 'settings';
const homepageDocName = 'homepage';

export const getHomepageSettings = async (): Promise<HomepageSettings | null> => {
    const docRef = doc(db, settingsCollectionName, homepageDocName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data() as DocumentData;
        return {
            heroImageUrl: data.heroImageUrl || ''
        };
    } else {
        // Return a default or empty state if the document doesn't exist
        return { heroImageUrl: "https://placehold.co/1800x1200.png" };
    }
};

export const updateHomepageSettings = async (settings: Partial<HomepageSettings>): Promise<void> => {
    const docRef = doc(db, settingsCollectionName, homepageDocName);
    // Use setDoc with merge: true to create or update the document
    await setDoc(docRef, settings, { merge: true });
};
