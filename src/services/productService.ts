
import { db, storage } from '@/lib/firebase';
import { Product } from '@/lib/types';
import { collection, getDocs, query, where, limit, doc, getDoc, addDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';


const MOCK_PRODUCTS: Product[] = [
    { id: '1', name: 'Elegant Diamond Ring', description: 'A timeless piece with a brilliant-cut diamond.', price: 1200, category: 'Rings', stock: 10, tags: ['new', 'diamond', 'popular'], imageUrl: 'https://picsum.photos/400/400?random=10' },
    { id: '2', name: 'Sapphire Necklace', description: 'Deep blue sapphire pendant on a silver chain.', price: 850, category: 'Necklaces', stock: 5, tags: ['sale', 'popular'], imageUrl: 'https://picsum.photos/400/400?random=11' },
    { id: '3', name: 'Gold Charm Bracelet', description: 'A beautiful gold bracelet with customizable charms.', price: 450, category: 'Bracelets', stock: 15, tags: ['popular'], imageUrl: 'https://picsum.photos/400/400?random=12' },
    { id: '4', name: 'Pearl Stud Earrings', description: 'Classic pearl earrings for a touch of class.', price: 150, category: 'Earrings', stock: 20, tags: ['popular'], imageUrl: 'https://picsum.photos/400/400?random=13' },
    { id: '5', name: 'Ruby Pendant', description: 'A fiery ruby set in a delicate rose gold pendant.', price: 950, category: 'Necklaces', stock: 8, tags: ['new', 'popular'], imageUrl: 'https://picsum.photos/400/400?random=14' },
    { id: '6', name: 'Silver Bangle', description: 'A sleek and modern silver bangle.', price: 250, category: 'Bracelets', stock: 25, tags: ['new'], imageUrl: 'https://picsum.photos/400/400?random=15' },
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
        console.error("Error fetching products, returning mock data: ", error);
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
        console.error(`Error fetching product by id ${id}, returning mock data: `, error);
        return MOCK_PRODUCTS.find(p => p.id === id) || null;
    }
};

export const getNewArrivals = async (count: number): Promise<Product[]> => {
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

const uploadImage = async (imageFile: File): Promise<string> => {
    const storageRef = ref(storage, `products/${imageFile.name}-${Date.now()}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    return await getDownloadURL(snapshot.ref);
}

export const addProduct = async (productData: Omit<Product, 'id' | 'imageUrl'> & { image?: File }, imageFile: File): Promise<void> => {
    try {
        const imageUrl = await uploadImage(imageFile);
        const productsCol = collection(db, 'products');
        
        // Exclude the File object before saving to Firestore
        const { image, ...dataToSave } = productData;

        await addDoc(productsCol, {
            ...dataToSave,
            imageUrl,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error adding product:", error);
        throw error;
    }
}

export const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id'>> & { image?: File }, imageFile?: File): Promise<void> => {
    try {
        const productRef = doc(db, 'products', id);
        
        const { image, ...dataToSave } = productData;
        
        if (imageFile) {
            (dataToSave as any).imageUrl = await uploadImage(imageFile);
        }

        await updateDoc(productRef, {
            ...dataToSave,
            updatedAt: serverTimestamp(),
        });

    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
}

export const deleteProduct = async (id: string, imageUrl?: string): Promise<void> => {
     try {
        const productRef = doc(db, 'products', id);
        await deleteDoc(productRef);

        if (imageUrl) {
            // Check if the URL is a Firebase Storage URL
            if(imageUrl.includes('firebasestorage.googleapis.com')) {
                const imageRef = ref(storage, imageUrl);
                await deleteObject(imageRef);
            }
        }
    } catch (error) {
        // Don't throw if image deletion fails, but log it
        console.error("Error deleting product image, but product document was deleted:", error);
        // if the error is not 'object-not-found', then it's a real issue
        if ((error as any).code !== 'storage/object-not-found') {
            throw error;
        }
    }
}
