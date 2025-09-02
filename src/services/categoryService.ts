
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, DocumentData, QueryDocumentSnapshot, getDoc } from 'firebase/firestore';


export interface Category {
  id: string;
  name: string;
}

const categoryCollection = db ? collection(db, 'categories') : null;

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Category => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        name: data.name,
    };
}

const getCurrentUser = () => {
    if (!auth) return null;
    return auth.currentUser;
}

export const getCategories = async (): Promise<Category[]> => {
    if (!categoryCollection) return [];
    const snapshot = await getDocs(categoryCollection);
    return snapshot.docs.map(fromFirestore);
};

export const addCategory = async (category: Omit<Category, 'id'>): Promise<string> => {
    if (!categoryCollection) throw new Error("Database not initialized");
    const docRef = await addDoc(categoryCollection, category);
    return docRef.id;
};

export const updateCategory = async (id: string, category: Partial<Category>): Promise<void> => {
    if (!db) throw new Error("Database not initialized");
    const categoryDoc = doc(db, 'categories', id);
    await updateDoc(categoryDoc, category);
};

export const deleteCategory = async (id: string): Promise<void> => {
    if (!db) throw new Error("Database not initialized");
    const categoryDoc = doc(db, 'categories', id);
    await deleteDoc(categoryDoc);
};
