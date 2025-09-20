
import { adminDb } from '@/lib/firebase-admin';
import { Product } from '@/lib/types';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';

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

export const getAllProducts = async (): Promise<Product[]> => {
    if (!adminDb) {
        console.error("Error fetching all products: Firestore admin is not initialized.");
        return [];
    }
    try {
        const productsCol = collection(adminDb, 'products');
        const snapshot = await getDocs(productsCol);
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => toPlainObject({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching products: ", error);
        throw new Error(`Failed to fetch products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const getNewArrivals = async (count: number): Promise<Product[]> => {
    if (!adminDb) {
        console.error("Error fetching new arrivals: Firestore admin is not initialized.");
        return [];
    }
    try {
        const productsRef = collection(adminDb, 'products');
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

export const getTrendingProducts = async (count: number): Promise<Product[]> => {
    if (!adminDb) {
        console.error("Error fetching trending products: Firestore admin is not initialized.");
        return [];
    }
    try {
        const productsRef = collection(adminDb, 'products');
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

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
    if (!adminDb) {
        console.error(`Error fetching products for category ${category}: Firestore admin is not initialized.`);
        return [];
    }
    try {
        const productsRef = collection(adminDb, 'products');
        const q = query(productsRef, where("category", "==", category), where("isPublished", "==", true));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => toPlainObject({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`Error fetching products for category ${category}: `, error);
        return [];
    }
};
