
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, DocumentData, QueryDocumentSnapshot, serverTimestamp, Timestamp, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate: number; // Store as timestamp
  minPurchase: number;
  isActive: boolean;
}

const couponCollection = collection(db, 'coupons');

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Coupon => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        expiryDate: data.expiryDate,
        minPurchase: data.minPurchase,
        isActive: data.isActive,
    };
}

const getCurrentUser = () => {
    const auth = getAuth();
    return auth.currentUser;
}

export const getCoupons = async (): Promise<Coupon[]> => {
    const snapshot = await getDocs(couponCollection);
    return snapshot.docs.map(fromFirestore);
};

export const addCoupon = async (coupon: Omit<Coupon, 'id'>): Promise<string> => {
    const docRef = await addDoc(couponCollection, coupon);
    return docRef.id;
};

export const updateCoupon = async (id: string, coupon: Partial<Coupon>): Promise<void> => {
    const couponDoc = doc(db, 'coupons', id);
    await updateDoc(couponDoc, coupon);
};

export const deleteCoupon = async (id: string): Promise<void> => {
    const couponDoc = doc(db, 'coupons', id);
    await deleteDoc(couponDoc);
};
