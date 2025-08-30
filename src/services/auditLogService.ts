
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: 'PRODUCT' | 'CATEGORY' | 'ORDER' | 'COUPON' | 'USER';
  entityId: string;
  timestamp: number;
  details: string;
}

const auditLogCollection = collection(db, 'auditLogs');

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): AuditLog => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        userId: data.userId,
        userName: data.userName,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        timestamp: data.timestamp,
        details: data.details,
    };
}


export const createLog = async (logData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<string> => {
    const docRef = await addDoc(auditLogCollection, {
        ...logData,
        timestamp: Date.now()
    });
    return docRef.id;
};

export const getLogs = async (): Promise<AuditLog[]> => {
    const q = query(auditLogCollection, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(fromFirestore);
};
