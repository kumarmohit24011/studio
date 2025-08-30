
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, DocumentData, QueryDocumentSnapshot, getDoc } from 'firebase/firestore';
import { createLog } from './auditLogService';
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
    const user = getCurrentUser();
    const docRef = await addDoc(categoryCollection, category);
    await createLog({
        action: 'CREATE',
        entityType: 'CATEGORY',
        entityId: docRef.id,
        details: `Category "${category.name}" was created.`,
        userId: user?.uid || 'system',
        userName: user?.displayName || 'System'
    });
    return docRef.id;
};

export const updateCategory = async (id: string, category: Partial<Category>): Promise<void> => {
    const user = getCurrentUser();
    const categoryDoc = doc(db, 'categories', id);
    await updateDoc(categoryDoc, category);
    await createLog({
        action: 'UPDATE',
        entityType: 'CATEGORY',
        entityId: id,
        details: `Category was updated to "${category.name}".`,
        userId: user?.uid || 'system',
        userName: user?.displayName || 'System'
    });
};

export const deleteCategory = async (id: string): Promise<void> => {
    const user = getCurrentUser();
    const categoryRef = doc(db, 'categories', id);
    const categorySnap = await getDoc(categoryRef);
    const categoryName = categorySnap.data()?.name || 'N/A';

    const categoryDoc = doc(db, 'categories', id);
    await deleteDoc(categoryDoc);

    await createLog({
        action: 'DELETE',
        entityType: 'CATEGORY',
        entityId: id,
        details: `Category "${categoryName}" was deleted.`,
        userId: user?.uid || 'system',
        userName: user?.displayName || 'System'
    });
};
