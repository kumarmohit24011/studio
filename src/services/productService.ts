
import { db, storage } from '@/lib/firebase';
import { Product } from '@/lib/types';
import { collection, getDocs, query, where, limit, doc, getDoc, addDoc, serverTimestamp, updateDoc, deleteDoc, orderBy, getCountFromServer, writeBatch, documentId } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { invalidateCache } from '@/lib/cache-invalidation';

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
    try {
        const productsCol = collection(db, 'products');
        const snapshot = await getDocs(productsCol);
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => toPlainObject({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching products: ", error);
        return [];
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
            const chunkProducts = snapshot.docs.map(doc => toPlainObject({ id: doc.id, ...doc.data() }));
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
        console.error("Error fetching product count: ", error);
        return 0;
    }
};


export const getProductById = async (id: string): Promise<Product | null> => {
    try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return toPlainObject({ id: docSnap.id, ...docSnap.data() });
        }
        return null;
    } catch (error) {
        console.error(`Error fetching product by id ${id}: `, error);
        return null;
    }
};

export const getNewArrivals = async (count: number): Promise<Product[]> => {
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where("tags", "array-contains", "new"), where("isPublished", "==", true), limit(count));
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

export const getRecentProducts = async (count: number): Promise<Product[]> => {
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, orderBy("createdAt", "desc"), limit(count));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => toPlainObject({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error("Error fetching recent products: ", error);
        return [];
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
        return snapshot.docs.map(doc => toPlainObject({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching trending products: ", error);
        return [];
    }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
    try {
        const productsRef = collection(db, 'products');
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
        await invalidateCache('products');
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
        await invalidateCache('products');

    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
}

export const deleteProduct = async (id: string, imageUrlsToDelete: string[] = []): Promise<void> => {
    try {
        const productRef = doc(db, 'products', id);
        await deleteDoc(productRef);

        const deletePromises = imageUrlsToDelete.map(async (url) => {
            if (!url.includes('firebasestorage.googleapis.com')) {
                return;
            }
            try {
                // Correctly create a reference from the download URL
                const imageRef = ref(storage, url);
                await deleteObject(imageRef);
            } catch (error: any) {
                if (error.code === 'storage/object-not-found') {
                    console.warn(`Image not found, skipping deletion: ${url}`);
                } else if (error.code === 'storage/invalid-argument') {
                    // This can happen if the URL is not a valid storage URL.
                    // Let's try to extract the path.
                    try {
                        const path = new URL(url).pathname.split('/o/')[1];
                        const decodedPath = decodeURIComponent(path.split('?')[0]);
                        const pathRef = ref(storage, decodedPath);
                        await deleteObject(pathRef);
                    } catch (pathError) {
                        console.error(`Failed to delete image from path ${url}:`, pathError);
                    }
                } else {
                    console.error(`Failed to delete image ${url}:`, error);
                }
            }
        });
        
        await Promise.all(deletePromises);

    } catch (error) {
        console.error("Error deleting product and its images:", error);
        throw error;
    }
};


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
