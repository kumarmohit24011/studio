
import { db } from '@/lib/firebase';
import { Product } from '@/lib/types';
import { collection, getDocs, query, where, limit, doc, getDoc } from 'firebase/firestore';

const MOCK_PRODUCTS: Product[] = [
    { id: '1', name: 'Elegant Diamond Ring', description: 'A timeless piece with a brilliant-cut diamond.', price: 1200, category: 'Rings', stock: 10, tags: ['new', 'diamond', 'popular'], imageUrl: 'https://picsum.photos/400/400?random=10' },
    { id: '2', name: 'Sapphire Necklace', description: 'Deep blue sapphire pendant on a silver chain.', price: 850, category: 'Necklaces', stock: 5, tags: ['sale', 'popular'], imageUrl: 'https://picsum.photos/400/400?random=11' },
    { id: '3', name: 'Gold Charm Bracelet', description: 'A beautiful gold bracelet with customizable charms.', price: 450, category: 'Bracelets', stock: 15, tags: ['popular'], imageUrl: 'https://picsum.photos/400/400?random=12' },
    { id: '4', name: 'Pearl Stud Earrings', description: 'Classic pearl earrings for a touch of class.', price: 150, category: 'Earrings', stock: 20, tags: ['popular'], imageUrl: 'https://picsum.photos/400/400?random=13' },
    { id: '5', name: 'Ruby Pendant', description: 'A fiery ruby set in a delicate rose gold pendant.', price: 950, category: 'Necklaces', stock: 8, tags: ['new', 'popular'], imageUrl: 'https://picsum.photos/400/400?random=14' },
    { id: '6', name: 'Silver Bangle', description: 'A sleek and modern silver bangle.', price: 250, category: 'Bracelets', stock: 25, tags: ['new'], imageUrl: 'https://picsum.photos/400/400?random=15' },
];


export const getAllProducts = async (): Promise<Product[]> => {
    if (!db) {
        console.warn("Firestore is not initialized. Returning mock products.");
        return MOCK_PRODUCTS;
    }
    try {
        const productsCol = collection(db, 'products');
        const snapshot = await getDocs(productsCol);
        if (snapshot.empty) {
            console.log('No products found, returning mock data.');
            return MOCK_PRODUCTS;
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error("Error fetching products, returning mock data: ", error);
        return MOCK_PRODUCTS;
    }
};

export const getProductById = async (id: string): Promise<Product | null> => {
    if (!db) {
        console.warn("Firestore is not initialized. Returning mock product.");
        return MOCK_PRODUCTS.find(p => p.id === id) || null;
    }
    try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Product;
        }
        console.warn(`Product with id ${id} not found in Firestore, checking mock data.`);
        return MOCK_PRODUCTS.find(p => p.id === id) || null;
    } catch (error) {
        console.error(`Error fetching product by id ${id}, returning mock data: `, error);
        return MOCK_PRODUCTS.find(p => p.id === id) || null;
    }
};

export const getNewArrivals = async (count: number): Promise<Product[]> => {
    if (!db) {
        console.warn("Firestore is not initialized. Returning mock new arrivals.");
        return MOCK_PRODUCTS.filter(p => p.tags?.includes('new')).slice(0, count);
    }
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where("tags", "array-contains", "new"), limit(count));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            console.log('No new arrivals found, returning mock data.');
            return MOCK_PRODUCTS.filter(p => p.tags?.includes('new')).slice(0, count);
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error("Error fetching new arrivals, returning mock data: ", error);
        return MOCK_PRODUCTS.filter(p => p.tags?.includes('new')).slice(0, count);
    }
};

export const getTrendingProducts = async (count: number): Promise<Product[]> => {
    if (!db) {
        console.warn("Firestore is not initialized. Returning mock trending products.");
        return MOCK_PRODUCTS.filter(p => p.tags?.includes('popular')).slice(0, count);
    }
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where("tags", "array-contains", "popular"), limit(count));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            console.log('No trending products found, returning mock data.');
            return MOCK_PRODUCTS.filter(p => p.tags?.includes('popular')).slice(0, count);
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error("Error fetching trending products, returning mock data: ", error);
        return MOCK_PRODUCTS.filter(p => p.tags?.includes('popular')).slice(0, count);
    }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
    if (!db) {
        console.warn("Firestore is not initialized. Returning mock products by category.");
        return MOCK_PRODUCTS.filter(p => p.category === category);
    }
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where("category", "==", category));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            console.log(`No products found for category ${category}, returning mock data.`);
            return MOCK_PRODUCTS.filter(p => p.category === category);
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error(`Error fetching products for category ${category}, returning mock data: `, error);
        return MOCK_PRODUCTS.filter(p => p.category === category);
    }
};
