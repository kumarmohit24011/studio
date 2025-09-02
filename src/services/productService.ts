
import { db, storage, auth } from '@/lib/firebase';
import { Product } from '@/lib/placeholder-data';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const productCollection = db ? collection(db, 'products') : null;

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Product => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        name: data.name,
        description: data.description,
        price: data.price,
        images: data.images,
        category: data.category,
        sku: data.sku,
        stock: data.stock,
        tags: data.tags || null,
    };
}

const getCurrentUser = () => {
    if (!auth) return null;
    return auth.currentUser;
}

export const getProducts = async (): Promise<Product[]> => {
    if (!productCollection) return [];
    const snapshot = await getDocs(productCollection);
    return snapshot.docs.map(fromFirestore);
};

export const getProduct = async (id: string): Promise<Product | null> => {
    if (!db) return null;
    const productDoc = doc(db, 'products', id);
    const docSnap = await getDoc(productDoc);
    if (docSnap.exists()) {
        return fromFirestore(docSnap as QueryDocumentSnapshot<DocumentData>);
    } else {
        return null;
    }
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
    if (!productCollection) throw new Error("Database not initialized");
    const docRef = await addDoc(productCollection, product);
    return docRef.id;
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<void> => {
    if (!db) throw new Error("Database not initialized");
    const productDoc = doc(db, 'products', id);
    await updateDoc(productDoc, product);
};

export const deleteProduct = async (id: string): Promise<void> => {
    if (!db) throw new Error("Database not initialized");
    const productDoc = doc(db, 'products', id);
    await deleteDoc(productDoc);
};

export const uploadProductImage = async (file: File): Promise<string> => {
  if (!storage) throw new Error("Storage not initialized");
  const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};
