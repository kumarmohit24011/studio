
import { db, storage } from '@/lib/firebase';
import { Product } from '@/lib/placeholder-data';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const productCollection = collection(db, 'products');

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Product => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        name: data.name,
        description: data.description,
        price: data.price,
        images: data.images,
        category: data.category,
        metal: data.metal,
        gemstone: data.gemstone || null,
        sku: data.sku,
        stock: data.stock,
        tags: data.tags || null,
    };
}

export const getProducts = async (): Promise<Product[]> => {
    const snapshot = await getDocs(productCollection);
    return snapshot.docs.map(fromFirestore);
};

export const getProduct = async (id: string): Promise<Product | null> => {
    const productDoc = doc(db, 'products', id);
    const docSnap = await getDoc(productDoc);
    if (docSnap.exists()) {
        return fromFirestore(docSnap as QueryDocumentSnapshot<DocumentData>);
    } else {
        return null;
    }
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
    const docRef = await addDoc(productCollection, product);
    return docRef.id;
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<void> => {
    const productDoc = doc(db, 'products', id);
    await updateDoc(productDoc, product);
};

export const deleteProduct = async (id: string): Promise<void> => {
    const productDoc = doc(db, 'products', id);
    await deleteDoc(productDoc);
};

export const uploadProductImage = async (file: File): Promise<string> => {
  const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};
