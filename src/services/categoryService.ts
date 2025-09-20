
'use client';
import { db, storage } from '@/lib/firebase';
import { Category } from '@/lib/types';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp, updateDoc, deleteDoc, writeBatch, query, where, Firestore } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { triggerCacheRevalidation } from '@/lib/cache-client';

// This file is now safe to be used on both client and server,
// as it does not directly import the Firebase Admin SDK.

export const getCategoryById = async (id: string): Promise<Category | null> => {
    try {
        const docRef = doc(db, 'categories', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
            } as Category;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching category by id ${id}: `, error);
        return null;
    }
};


const uploadCategoryImage = async (imageFile: File): Promise<string> => {
    const storageRef = ref(storage, `categories/${imageFile.name}-${Date.now()}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    return await getDownloadURL(snapshot.ref);
};

export const addCategory = async (category: Omit<Category, 'id' | 'createdAt'>, imageFile?: File): Promise<void> => {
    try {
        let imageUrl = category.imageUrl || '';
        
        if (imageFile) {
            imageUrl = await uploadCategoryImage(imageFile);
        }
        
        const categoriesCol = collection(db, 'categories');
        await addDoc(categoriesCol, {
            ...category,
            imageUrl,
            createdAt: serverTimestamp(),
        });
        await triggerCacheRevalidation('categories');
    } catch (error) {
        console.error("Error adding category: ", error);
        throw error;
    }
};

export const updateCategory = async (id: string, data: Partial<Omit<Category, 'id' | 'createdAt'>>, imageFile?: File): Promise<void> => {
    try {
        let updateData = { ...data };
        
        if (imageFile) {
            const imageUrl = await uploadCategoryImage(imageFile);
            updateData = { ...updateData, imageUrl };
        }
        
        const categoryRef = doc(db, 'categories', id);
        await updateDoc(categoryRef, updateData);
        await triggerCacheRevalidation('categories');
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
        await triggerCacheRevalidation('categories');
    } catch (error) {
        console.error("Error updating category order: ", error);
        throw error;
    }
};

export const deleteCategory = async (id: string): Promise<void> => {
    try {
        const categoryRef = doc(db, 'categories', id);
        await deleteDoc(categoryRef);
        await triggerCacheRevalidation('categories');
    } catch (error) {
        console.error("Error deleting category: ", error);
        throw error;
    }
}

// Client-side specific version of getAllCategories for admin panels etc.
export const getAllCategoriesClient = async (): Promise<Category[]> => {
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
        console.error("Error fetching categories on client: ", error);
        throw new Error(`Failed to fetch categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
