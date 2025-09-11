
import { db } from '@/lib/firebase';
import { Category } from '@/lib/types';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp, updateDoc, deleteDoc, writeBatch, query, where } from 'firebase/firestore';
import { invalidateCache } from '@/lib/cache-invalidation';

export const getAllCategories = async (): Promise<Category[]> => {
    try {
        const categoriesCol = collection(db, 'categories');
        const snapshot = await getDocs(categoriesCol);
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
                } as Category
            })
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    } catch (error) {
        console.error("Error fetching categories: ", error);
        return [];
    }
};

export const getFeaturedCategories = async (): Promise<Category[]> => {
    try {
        const categoriesCol = collection(db, 'categories');
        const q = query(categoriesCol, where("isFeatured", "==", true));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs
            .map(doc => {
                 const data = doc.data();
                 return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
                 } as Category
            })
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    } catch (error) {
        console.error("Error fetching featured categories: ", error);
        return [];
    }
};


export const getCategoryById = async (id: string): Promise<Category | null> => {
    try {
        const docRef = doc(db, 'categories', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Category;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching category by id ${id}: `, error);
        return null;
    }
};


export const addCategory = async (category: Omit<Category, 'id' | 'createdAt'>): Promise<void> => {
    try {
        const categoriesCol = collection(db, 'categories');
        await addDoc(categoriesCol, {
            ...category,
            createdAt: serverTimestamp(),
        });
        await invalidateCache('categories');
    } catch (error) {
        console.error("Error adding category: ", error);
        throw error;
    }
};

export const updateCategory = async (id: string, data: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<void> => {
    try {
        const categoryRef = doc(db, 'categories', id);
        await updateDoc(categoryRef, data);
        await invalidateCache('categories');
    } catch (error) {
        console.error("Error updating category: ", error);
        throw error;
    }
};

export const updateCategoryOrder = async (categories: { id: string; order: number }[]): Promise<void> => {
    try {
        const batch = writeBatch(db);
        categories.forEach(category => {
            const categoryRef = doc(db, 'categories', category.id);
            batch.update(categoryRef, { order: category.order });
        });
        await batch.commit();
        await invalidateCache('categories');
    } catch (error) {
        console.error("Error updating category order: ", error);
        throw error;
    }
};


export const deleteCategory = async (id: string): Promise<void> => {
    try {
        const categoryRef = doc(db, 'categories', id);
        await deleteDoc(categoryRef);
        await invalidateCache('categories');
    } catch (error) {
        console.error("Error deleting category: ", error);
        throw error;
    }
}
