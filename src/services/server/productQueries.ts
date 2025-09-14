
import 'server-only';
import { db } from '@/lib/firebase';
import { Product } from '@/lib/types';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { unstable_cache } from 'next/cache';

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

export const getNewArrivals = unstable_cache(
    async (count: number): Promise<Product[]> => {
        try {
            const productsRef = collection(db, 'products');
            const q = query(productsRef, where("isPublished", "==", true), orderBy("createdAt", "desc"), limit(count));
            const snapshot = await getDocs(q);

            const allNewArrivals = snapshot.docs.map(doc => toPlainObject({ id: doc.id, ...doc.data() }));
            
            // Further filter for 'new' tag if needed, but sorting by createdAt is more reliable
            const newTagged = allNewArrivals.filter(p => p.tags?.includes('new'));
            
            // If there are enough 'new' tagged products, return them. Otherwise, return the most recent.
            return newTagged.length > 0 ? newTagged.slice(0, count) : allNewArrivals;

        } catch (error) {
            console.error("Error fetching new arrivals: ", error);
            return [];
        }
    },
    ['new-arrivals'],
    { tags: ['products', 'new-arrivals'] }
);

// Changed to a direct fetch to avoid caching issues.
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

