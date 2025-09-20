
import { adminDb } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase'; // Client-side fallback
import { Product } from '@/lib/types';
import { collection, getDocs, query, where, limit, orderBy, Firestore } from 'firebase/firestore';

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
    const firestore = adminDb || db; // Use admin DB if available, otherwise client DB
    if (!firestore) {
        console.error("Error fetching new arrivals: Firestore is not initialized.");
        return [];
    }
    try {
        const productsRef = collection(firestore as Firestore, 'products');
        // Query for products that are published and have the 'new' tag.
        const q = query(
            productsRef, 
            where("isPublished", "==", true), 
            where("isNewArrival", "==", true),
            orderBy("createdAt", "desc"), 
            limit(count)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return [];
        }
        
        const products = snapshot.docs.map(doc => toPlainObject({ id: doc.id, ...doc.data() }));
        return products;

    } catch (error) {
        console.error("Error fetching new arrivals: ", error);
        return [];
    }
};

// This function now fetches directly from Firebase to avoid caching issues.
export const getTrendingProducts = async (count: number): Promise<Product[]> => {
    const firestore = adminDb || db; // Use admin DB if available, otherwise client DB
    if (!firestore) {
        console.error("Error fetching trending products: Firestore is not initialized.");
        return [];
    }
    try {
        const productsRef = collection(firestore as Firestore, 'products');
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
