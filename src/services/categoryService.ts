
import { getFirebaseServices } from '@/lib/firebase';
import { Category } from '@/lib/types';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const MOCK_CATEGORIES: Category[] = [
    { id: 'rings', name: 'Rings', description: 'Elegant rings for every occasion.', imageUrl: 'https://picsum.photos/400/300?random=1' },
    { id: 'necklaces', name: 'Necklaces', description: 'Stunning necklaces to complete your look.', imageUrl: 'https://picsum.photos/400/300?random=2' },
    { id: 'bracelets', name: 'Bracelets', description: 'Charming bracelets to adorn your wrist.', imageUrl: 'https://picsum.photos/400/300?random=3' },
];

export const getAllCategories = async (): Promise<Category[]> => {
    try {
        const { db } = getFirebaseServices();
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
        const { db } = getFirebaseServices();
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
