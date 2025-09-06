
import { db } from '@/lib/firebase';
import { Category } from '@/lib/types';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';

const MOCK_CATEGORIES: Category[] = [
    { id: 'rings', name: 'Rings', description: 'Elegant rings for every occasion.', createdAt: new Date() },
    { id: 'necklaces', name: 'Necklaces', description: 'Stunning necklaces to complete your look.', createdAt: new Date() },
    { id: 'bracelets', name: 'Bracelets', description: 'Charming bracelets to adorn your wrist.', createdAt: new Date() },
];

export const getAllCategories = async (): Promise<Category[]> => {
    try {
        const categoriesCol = collection(db, 'categories');
        const snapshot = await getDocs(categoriesCol);
        if (snapshot.empty) {
            console.log('No categories found in Firestore, returning mock data.');
            return MOCK_CATEGORIES;
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)).sort((a, b) => a.name.localeCompare(b.name));
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


export const addCategory = async (category: Omit<Category, 'id' | 'createdAt'>): Promise<void> => {
    try {
        const categoriesCol = collection(db, 'categories');
        await addDoc(categoriesCol, {
            ...category,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error adding category: ", error);
        throw error;
    }
};

export const updateCategory = async (id: string, data: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<void> => {
    try {
        const categoryRef = doc(db, 'categories', id);
        await updateDoc(categoryRef, data);
    } catch (error) {
        console.error("Error updating category: ", error);
        throw error;
    }
};


export const deleteCategory = async (id: string): Promise<void> => {
    try {
        const categoryRef = doc(db, 'categories', id);
        await deleteDoc(categoryRef);
    } catch (error) {
        console.error("Error deleting category: ", error);
        throw error;
    }
}
