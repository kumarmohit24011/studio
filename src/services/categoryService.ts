
import { db } from '@/lib/firebase';
import { Category } from '@/lib/types';
import { collection, getDocs, doc, getDoc, getFirestore, terminate } from 'firebase/firestore';

const MOCK_CATEGORIES: Category[] = [
    { id: 'rings', name: 'Rings', description: 'Elegant rings for every occasion.', imageUrl: 'https://picsum.photos/400/300?random=1' },
    { id: 'necklaces', name: 'Necklaces', description: 'Stunning necklaces to complete your look.', imageUrl: 'https://picsum.photos/400/300?random=2' },
    { id: 'bracelets', name: 'Bracelets', description: 'Charming bracelets to adorn your wrist.', imageUrl: 'https://picsum.photos/400/300?random=3' },
];

async function isFirestoreOnline(dbInstance: any) {
  try {
    // Firestore doesn't have a direct 'isOnline' check. 
    // A lightweight operation like getting a non-existent doc in a non-existent collection 
    // can serve as a proxy, but it's not foolproof and can be slow.
    // A simpler check might be to rely on the SDK's offline behavior and robust error handling.
    // For this fix, we will rely on the catch block which triggers on network failures.
    await getDoc(doc(dbInstance, 'healthcheck', 'status'));
    return true;
  } catch (e) {
    // Errors like 'unavailable' or 'deadline-exceeded' suggest offline status.
    const error = e as any;
    if (error.code === 'unavailable' || error.code === 'deadline-exceeded' || error.message.includes('offline')) {
      return false;
    }
    // If it's another kind of error (e.g. permission-denied), we might still be "online".
    // However, for the user's issue, any failure to connect should serve mock data.
    return false;
  }
}


export const getAllCategories = async (): Promise<Category[]> => {
    try {
        const categoriesCol = collection(db, 'categories');
        const snapshot = await getDocs(categoriesCol);
        if (snapshot.empty) {
            console.log('No categories found in Firestore, returning mock data.');
            return MOCK_CATEGORIES;
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    } catch (error) {
        console.error("Error fetching categories, returning mock data: ", error);
        return MOCK_CATEGORIES;
    }
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
    try {
        const docRef = doc(db, 'categories', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Category;
        }
        console.warn(`Category with id ${id} not found in Firestore, checking mock data.`);
        return MOCK_CATEGORIES.find(c => c.id === id) || null;
    } catch (error) {
        console.error(`Error fetching category by id ${id}, returning mock data: `, error);
        return MOCK_CATEGORIES.find(c => c.id === id) || null;
    }
};
