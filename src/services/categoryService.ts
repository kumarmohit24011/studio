
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, DocumentData, QueryDocumentSnapshot, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


export interface Category {
  id: string;
  name: string;
}

const categoryCollection = collection(db, 'categories');

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Category => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        name: data.name,
    };
}

const getCurrentUser = () => {
    const auth = getAuth();
    return auth.currentUser;
}

export const getCategories = async (): Promise<Category[]> => {
    const snapshot = await getDocs(categoryCollection);
    return snapshot.docs.map(fromFirestore);
};

export const addCategory = async (category: Omit<Category, 'id'>): Promise<string> => {
    const docRef = await addDoc(categoryCollection, category);
    return docRef.id;
};

export const updateCategory = async (id: string, category: Partial<Category>): Promise<void> => {
    const categoryDoc = doc(db, 'categories', id);
    await updateDoc(categoryDoc, category);
};

export const deleteCategory = async (id: string): Promise<void> => {
    const categoryDoc = doc(db, 'categories', id);
    await deleteDoc(categoryDoc);
};
