
import 'server-only';
import { db } from '@/lib/firebase';
import { Product } from '@/lib/types';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { revalidatePath, unstable_cache } from 'next/cache';

const toPlainObject = (product: any): Product => {
    if (!product) return product;
    const plainProduct = { ...product };
    if (product.createdAt?.seconds) {
        plainProduct.createdAt = new Date(product.createdAt.seconds * 1000).toISOString();
    }
    if (product.updatedAt?.seconds) {
        plainProduct.updatedAt = new Date(product.updatedAt.seconds * 1000).toISOString();
    }
    return plainProduct;
};

// This function now fetches directly from Firebase to avoid caching issues.
export const getNewArrivals = async (count: number): Promise<Product[]> => {
    try {
        const productsRef = collection(db, 'products');
        // Query for products that are published and have the 'new' tag.
        const q = query(
            productsRef, 
            where("isPublished", "==", true), 
            where("tags", "array-contains", "new"),
            orderBy("createdAt", "desc"), 
            limit(count)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return [];
        }
        
        return snapshot.docs.map(doc => toPlainObject({ id: doc.id, ...doc.data() }));

    } catch (error) {
        console.error("Error fetching new arrivals: ", error);
        return [];
    }
};

// This function now fetches directly from Firebase to avoid caching issues.
export const getTrendingProducts = async (count: number): Promise<Product[]> => {
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where("tags", "array-contains", "popular"), where("isPublished", "==", true), limit(count));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => toPlainObject({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching trending products: ", error);
        return [];
    }
};



