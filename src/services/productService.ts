
import { db, storage } from '@/lib/firebase';
import { Product } from '@/lib/types';
import { collection, getDocs, query, where, limit, doc, getDoc, addDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';


const MOCK_PRODUCTS: Product[] = [
    { id: '1', name: 'Elegant Diamond Ring', description: 'A timeless piece with a brilliant-cut diamond.', price: 1200, category: 'Rings', stock: 10, sku: 'RNG-DIA-001', tags: ['new', 'diamond', 'popular'], imageUrl: 'https://picsum.photos/400/400?random=10', imageUrls: ['https://picsum.photos/400/400?random=10', 'https://picsum.photos/400/400?random=11'] },
    { id: '2', name: 'Sapphire Necklace', description: 'Deep blue sapphire pendant on a silver chain.', price: 850, category: 'Necklaces', stock: 5, sku: 'NKL-SAP-001', tags: ['sale', 'popular'], imageUrl: 'https://picsum.photos/400/400?random=11' },
    { id: '3', name: 'Gold Charm Bracelet', description: 'A beautiful gold bracelet with customizable charms.', price: 450, category: 'Bracelets', stock: 15, sku: 'BRC-GLD-001', tags: ['popular'], imageUrl: 'https://picsum.photos/400/400?random=12' },
    { id: '4', name: 'Pearl Stud Earrings', description: 'Classic pearl earrings for a touch of class.', price: 150, category: 'Earrings', stock: 20, sku: 'ERN-PRL-001', tags: ['popular'], imageUrl: 'https://picsum.photos/400/400?random=13' },
    { id: '5', name: 'Ruby Pendant', description: 'A fiery ruby set in a delicate rose gold pendant.', price: 950, category: 'Necklaces', stock: 8, sku: 'NKL-RBY-001', tags: ['new', 'popular'], imageUrl: 'https://picsum.photos/400/400?random=14' },
    { id: '6', name: 'Silver Bangle', description: 'A sleek and modern silver bangle.', price: 250, category: 'Bracelets', stock: 25, sku: 'BRC-SLV-001', tags: ['new'], imageUrl: 'https://picsum.photos/400/400?random=15' },
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
};

const uploadImages = async (imageFiles: File[]): Promise<string[]> => {
    const uploadPromises = imageFiles.map(file => uploadImage(file));
    return Promise.all(uploadPromises);
};

export const addProduct = async (productData: Partial<Product> & { images?: File[] }, imageFiles: File[]): Promise<void> => {
    try {
        const imageUrls = await uploadImages(imageFiles);
        const productsCol = collection(db, 'products');
        
        const { images, ...dataToSave } = productData;

        await addDoc(productsCol, {
            ...dataToSave,
            imageUrl: imageUrls[0] || '', // First image as primary
            imageUrls,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error adding product:", error);
        throw error;
    }
}

export const updateProduct = async (
    id: string, 
    productData: Partial<Product> & { existingImageUrls?: string[] }, 
    newImageFiles: File[] = []
): Promise<void> => {
    try {
        const productRef = doc(db, 'products', id);
        
        const { existingImageUrls, ...dataToSave } = productData;

        let finalImageUrls = existingImageUrls || [];

        if (newImageFiles.length > 0) {
            const newImageUrls = await uploadImages(newImageFiles);
            finalImageUrls = [...finalImageUrls, ...newImageUrls];
        }

        const updatePayload: any = {
            ...dataToSave,
            imageUrls: finalImageUrls,
            imageUrl: finalImageUrls[0] || '',
            updatedAt: serverTimestamp(),
        };

        await updateDoc(productRef, updatePayload);

    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
}

export const deleteProduct = async (id: string, imageUrlsToDelete: string[] = []): Promise<void> => {
     try {
        const productRef = doc(db, 'products', id);
        // Optional: you might want to fetch the doc to ensure you have all image URLs if not passed in.
        // const productSnap = await getDoc(productRef);
        // const productData = productSnap.data() as Product;

        await deleteDoc(productRef);
        
        // Use the passed imageUrlsToDelete, it should be more reliable
        for (const url of imageUrlsToDelete) {
             if (url.includes('firebasestorage.googleapis.com')) {
                try {
                    const imageRef = ref(storage, url);
                    await deleteObject(imageRef);
                } catch (error: any) {
                     if (error.code !== 'storage/object-not-found') {
                        console.error(`Failed to delete image ${url}:`, error);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error deleting product and its images:", error);
        throw error;
    }
}
