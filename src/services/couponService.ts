
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, DocumentData, QueryDocumentSnapshot, serverTimestamp, Timestamp, getDoc } from 'firebase/firestore';
import { createLog } from './auditLogService';
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
    const user = getCurrentUser();
    const docRef = await addDoc(couponCollection, coupon);
    await createLog({
        action: 'CREATE',
        entityType: 'COUPON',
        entityId: docRef.id,
        details: `Coupon "${coupon.code}" was created.`,
        userId: user?.uid || 'system',
        userName: user?.displayName || 'System'
    });
    return docRef.id;
};

export const updateCoupon = async (id: string, coupon: Partial<Coupon>): Promise<void> => {
    const user = getCurrentUser();
    const couponDoc = doc(db, 'coupons', id);
    await updateDoc(couponDoc, coupon);
    await createLog({
        action: 'UPDATE',
        entityType: 'COUPON',
        entityId: id,
        details: `Coupon "${coupon.code}" was updated.`,
        userId: user?.uid || 'system',
        userName: user?.displayName || 'System'
    });
};

export const deleteCoupon = async (id: string): Promise<void> => {
    const user = getCurrentUser();
    const couponRef = doc(db, 'coupons', id);
    const couponSnap = await getDoc(couponRef);
    const couponCode = couponSnap.data()?.code || 'N/A';
    
    const couponDoc = doc(db, 'coupons', id);
    await deleteDoc(couponDoc);

    await createLog({
        action: 'DELETE',
        entityType: 'COUPON',
        entityId: id,
        details: `Coupon "${couponCode}" was deleted.`,
        userId: user?.uid || 'system',
        userName: user?.displayName || 'System'
    });
};
