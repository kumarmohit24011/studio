
import { db } from '@/lib/firebase';
import { ShippingAddress } from '@/lib/types';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, where, writeBatch, getDoc, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

const usersCollection = collection(db, 'users');

const getAddressesCollectionRef = (userId: string) => {
    return collection(doc(usersCollection, userId), 'addresses');
}

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): ShippingAddress => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        name: data.name,
        mobile: data.mobile,
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        isDefault: data.isDefault || false,
    };
}


export const addAddress = async (userId: string, address: Omit<ShippingAddress, 'id'>): Promise<string> => {
    const addressesRef = getAddressesCollectionRef(userId);
    
    // If this is the first address or isDefault is true, unset other defaults
    if (address.isDefault) {
        const q = query(addressesRef, where("isDefault", "==", true));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.forEach(doc => {
            batch.update(doc.ref, { isDefault: false });
        });
        await batch.commit();
    }

    const docRef = await addDoc(addressesRef, address);
    return docRef.id;
};

export const getAddresses = async (userId: string): Promise<ShippingAddress[]> => {
    const addressesRef = getAddressesCollectionRef(userId);
    const snapshot = await getDocs(addressesRef);
    return snapshot.docs.map(fromFirestore);
}

export const updateAddress = async (userId: string, addressId: string, addressData: Partial<ShippingAddress>): Promise<void> => {
    const addressDocRef = doc(getAddressesCollectionRef(userId), addressId);

    // If making this address default, unset other defaults
    if (addressData.isDefault) {
        const addressesRef = getAddressesCollectionRef(userId);
        const q = query(addressesRef, where("isDefault", "==", true));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.forEach(doc => {
            if(doc.id !== addressId) {
                batch.update(doc.ref, { isDefault: false });
            }
        });
        await batch.commit();
    }

    await updateDoc(addressDocRef, addressData);
}

export const deleteAddress = async (userId: string, addressId: string): Promise<void> => {
    const addressDocRef = doc(getAddressesCollectionRef(userId), addressId);
    await deleteDoc(addressDocRef);
}

export const setDefaultAddress = async (userId: string, addressId: string): Promise<void> => {
    const addressesRef = getAddressesCollectionRef(userId);
    const q = query(addressesRef, where("isDefault", "==", true));
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);

    // Unset current default
    snapshot.forEach(doc => {
        batch.update(doc.ref, { isDefault: false });
    });

    // Set new default
    const newDefaultRef = doc(addressesRef, addressId);
    batch.update(newDefaultRef, { isDefault: true });

    await batch.commit();
}
