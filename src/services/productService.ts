
import { db, storage } from '@/lib/firebase';
import { Product } from '@/lib/types';
import { collection, getDocs, query, where, limit, doc, getDoc, addDoc, serverTimestamp, updateDoc, deleteDoc, orderBy, getCountFromServer, writeBatch, documentId } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';


const MOCK_PRODUCTS: Product[] = [
    { id: '1', name: 'Elegant Diamond Ring', description: 'A timeless piece with a brilliant-cut diamond.', price: 1200, category: 'Rings', stock: 10, sku: 'RNG-DIA-001', tags: ['new', 'diamond', 'popular'], imageUrl: 'https://picsum.photos/400/400?random=10', imageUrls: ['https://picsum.photos/400/400?random=10', 'https://picsum.photos/400/400?random=11'], isPublished: true },
    { id: '2', name: 'Sapphire Necklace', description: 'Deep blue sapphire pendant on a silver chain.', price: 850, category: 'Necklaces', stock: 5, sku: 'NKL-SAP-001', tags: ['sale', 'popular'], imageUrl: 'https://picsum.photos/400/400?random=11', isPublished: true },
    { id: '3', name: 'Gold Charm Bracelet', description: 'A beautiful gold bracelet with customizable charms.', price: 450, category: 'Bracelets', stock: 15, sku: 'BRC-GLD-001', tags: ['popular'], imageUrl: 'https://picsum.photos/400/400?random=12', isPublished: true },
    { id: '4', name: 'Pearl Stud Earrings', description: 'Classic pearl earrings for a touch of class.', price: 150, category: 'Earrings', stock: 20, sku: 'ERN-PRL-001', tags: ['popular'], imageUrl: 'https://picsum.photos/400/400?random=13', isPublished: false },
    { id: '5', name: 'Ruby Pendant', description: 'A fiery ruby set in a delicate rose gold pendant.', price: 950, category: 'Necklaces', stock: 8, sku: 'NKL-RBY-001', tags: ['new', 'popular'], imageUrl: 'https://picsum.photos/400/400?random=14', isPublished: true },
    { id: '6', name: 'Silver Bangle', description: 'A sleek and modern silver bangle.', price: 250, category: 'Bracelets', stock: 25, sku: 'BRC-SLV-001', tags: ['new'], imageUrl: 'https://picsum.photos/400/400?random=15', isPublished: true },
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

export const getProductsByIds = async (ids: string[]): Promise<Product[]> => {
    if (ids.length === 0) {
        return [];
    }
    try {
        const products: Product[] = [];
        // Firestore 'in' query is limited to 30 items in a single query.
        // We chunk the IDs to handle more than 30.
        for (let i = 0; i < ids.length; i += 30) {
            const chunk = ids.slice(i, i + 30);
            const productsRef = collection(db, 'products');
            const q = query(productsRef, where(documentId(), "in", chunk));
            const snapshot = await getDocs(q);
            const chunkProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            products.push(...chunkProducts);
        }
        return products;
    } catch (error) {
        console.error("Error fetching products by IDs: ", error);
        return [];
    }
}


export const getTotalProducts = async (): Promise<number> => {
    try {
        const productsCol = collection(db, 'products');
        const snapshot = await getCountFromServer(productsCol);
        return snapshot.data().count;
    } catch (error) {
        console.error("Error fetching product count, returning mock data length: ", error);
        return MOCK_PRODUCTS.length;
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
        const q = query(productsRef, where("tags", "array-contains", "new"), where("isPublished", "==", true), limit(count));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            console.log('No new arrivals found, returning mock data.');
            return MOCK_PRODUCTS.filter(p => p.tags?.includes('new') && p.isPublished).slice(0, count);
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error("Error fetching new arrivals, returning mock data: ", error);
        return MOCK_PRODUCTS.filter(p => p.tags?.includes('new') && p.isPublished).slice(0, count);
    }
};

export const getRecentProducts = async (count: number): Promise<Product[]> => {
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, orderBy("createdAt", "desc"), limit(count));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            console.log('No recent products found, returning mock data.');
            return MOCK_PRODUCTS.slice(0, count);
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error("Error fetching recent products, returning mock data: ", error);
        return MOCK_PRODUCTS.slice(0, count);
    }
}

export const getTrendingProducts = async (count: number): Promise<Product[]> => {
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where("tags", "array-contains", "popular"), where("isPublished", "==", true), limit(count));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error("Error fetching trending products, returning empty array: ", error);
        return [];
    }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where("category", "==", category), where("isPublished", "==", true));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            console.log(`No products found for category ${category}, returning mock data.`);
            return MOCK_PRODUCTS.filter(p => p.category === category && p.isPublished);
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error(`Error fetching products for category ${category}, returning mock data: `, error);
        return MOCK_PRODUCTS.filter(p => p.category === category && p.isPublished);
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
        await deleteDoc(productRef);
        
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

export const deleteMultipleProducts = async (productsToDelete: Product[]): Promise<void> => {
    try {
        const batch = writeBatch(db);

        for (const product of productsToDelete) {
            const productRef = doc(db, 'products', product.id);
            batch.delete(productRef);
        }

        await batch.commit();

        for (const product of productsToDelete) {
             for (const url of product.imageUrls || []) {
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
        }

    } catch (error) {
        console.error("Error bulk deleting products:", error);
        throw error;
    }
};

export const updateProductStatus = async (
    productId: string, 
    status: { isPublished?: boolean; isNew?: boolean; isTrending?: boolean }
): Promise<void> => {
    try {
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);
        if (!productSnap.exists()) {
            throw new Error("Product not found");
        }

        const productData = productSnap.data() as Product;
        let currentTags = productData.tags || [];
        
        if (status.isNew !== undefined) {
            currentTags = currentTags.filter(tag => tag !== 'new');
            if (status.isNew) {
                currentTags.push('new');
            }
        }
        
        if (status.isTrending !== undefined) {
            currentTags = currentTags.filter(tag => tag !== 'popular');
            if (status.isTrending) {
                currentTags.push('popular');
            }
        }

        const updateData: any = {
            tags: currentTags,
            updatedAt: serverTimestamp(),
        };

        if (status.isPublished !== undefined) {
            updateData.isPublished = status.isPublished;
        }

        await updateDoc(productRef, updateData);
    } catch (error) {
        console.error("Error updating product status:", error);
        throw error;
    }
};
