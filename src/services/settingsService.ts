
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, DocumentData } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface HomepageSettings {
  heroImageUrl: string;
  offerImageUrl1: string;
  offerImageUrl2: string;
}

const settingsCollectionName = 'settings';
const homepageDocName = 'homepage';

export const getHomepageSettings = async (): Promise<HomepageSettings | null> => {
    const docRef = doc(db, settingsCollectionName, homepageDocName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data() as DocumentData;
        return {
            heroImageUrl: data.heroImageUrl || '',
            offerImageUrl1: data.offerImageUrl1 || '',
            offerImageUrl2: data.offerImageUrl2 || '',
        };
    } else {
        // Return a default or empty state if the document doesn't exist
        return { 
            heroImageUrl: "https://placehold.co/1800x1200.png",
            offerImageUrl1: "https://placehold.co/800x600.png",
            offerImageUrl2: "https://placehold.co/800x600.png",
        };
    }
};

export const updateHomepageSettings = async (settings: Partial<HomepageSettings>): Promise<void> => {
    const docRef = doc(db, settingsCollectionName, homepageDocName);
    // Use setDoc with merge: true to create or update the document
    await setDoc(docRef, settings, { merge: true });
};

export const uploadHomepageImage = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, `${path}/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

