
import { adminDb } from '@/lib/firebase-admin';
import { Category } from '@/lib/types';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

const toPlainObject = (category: any): Category => {
    if (!category) return category;
    const plain = { ...category };
    if (category.createdAt?.seconds) {
        plain.createdAt = new Date(category.createdAt.seconds * 1000).toISOString();
    }
    return plain;
};

export const getFeaturedCategories = async (): Promise<Category[]> => {
    if (!adminDb) {
        console.error("Error fetching featured categories: Firestore admin is not initialized.");
        return [];
    }
    try {
        const categoriesCol = collection(adminDb, 'categories');
        const q = query(categoriesCol, where("isFeatured", "==", true), orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => toPlainObject({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching featured categories: ", error);
        return [];
    }
};
