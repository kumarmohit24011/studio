
import { db } from '@/lib/firebase';
import { Product } from '@/lib/types';
import { collection, getDocs, query, where, limit, doc, getDoc } from 'firebase/firestore';

const MOCK_PRODUCTS: Product[] = [
    { id: '1', name: 'Elegant Diamond Ring', description: 'A timeless piece with a brilliant-cut diamond.', price: 1200, category: 'Rings', stock: 10, featured: true, tags: ['new', 'diamond'], imageUrl: 'https://picsum.photos/400/400?random=10' },
    { id: '2', name: 'Sapphire Necklace', description: 'Deep blue sapphire pendant on a silver chain.', price: 850, category: 'Necklaces', stock: 5, featured: true, tags: ['sale'], imageUrl: 'https://picsum.photos/400/400?random=11' },
    { id: '3', name: 'Gold Charm Bracelet', description: 'A beautiful gold bracelet with customizable charms.', price: 450, category: 'Bracelets', stock: 15, featured: true, tags: ['popular'], imageUrl: 'https://picsum.photos/400/400?random=12' },
    { id: '4', name: 'Pearl Stud Earrings', description: 'Classic pearl earrings for a touch of class.', price: 150, category: 'Earrings', stock: 20, featured: true, tags: [], imageUrl: 'https://picsum.photos/400/400?random=13' },
    { id: '5', name: 'Ruby Pendant', description: 'A fiery ruby set in a delicate rose gold pendant.', price: 950, category: 'Necklaces', stock: 8, tags: ['new'], imageUrl: 'https://picsum.photos/400/400?random=14' },
    { id: '6', name: 'Silver Bangle', description: 'A sleek and modern silver bangle.', price: 250, category: 'Bracelets', stock: 25, tags: [], imageUrl: 'https://picsum.photos/400/400?random=15' },
];


export const getAllProducts = async (): Promise<Product[]> => {
    try {
        const productsCol = collection(db, 'products');
        const snapshot = await getDocs(productsCol);
        if (snapshot.empty) {
            console.log('No products found, returning mock data.');
            return MOCK_PRODUCTS;
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error("Error fetching products: ", error);
        return MOCK_PRODUCTS;
    }
};

export const getProductById = async (id: string): Promise<Product | null> => {
    try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Product;
        }
        console.warn(`Product with id ${id} not found in Firestore, checking mock data.`);
        return MOCK_PRODUCTS.find(p => p.id === id) || null;
    } catch (error) {
        console.error("Error fetching product by id: ", error);
        return MOCK_PRODUCTS.find(p => p.id === id) || null;
    }
};

export const getFeaturedProducts = async (count: number): Promise<Product[]> => {
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where("featured", "==", true), limit(count));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return MOCK_PRODUCTS.filter(p => p.featured).slice(0, count);
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error("Error fetching featured products: ", error);
        return MOCK_PRODUCTS.filter(p => p.featured).slice(0, count);
    }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where("category", "==", category));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return MOCK_PRODUCTS.filter(p => p.category === category);
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error(`Error fetching products for category ${category}: `, error);
        return MOCK_PRODUCTS.filter(p => p.category === category);
    }
};
