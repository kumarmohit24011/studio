
import { db } from '@/lib/firebase';
import { ShippingAddress } from '@/lib/types';
import { UserProfile } from './userService';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const usersCollection = 'users';

export const addAddress = async (userId: string, address: Omit<ShippingAddress, 'id'>): Promise<string> => {
    const userDocRef = doc(db, usersCollection, userId);
    const newAddress = { ...address, id: uuidv4() };

    if (newAddress.isDefault) {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            const updatedAddresses = userData.addresses.map(addr => ({ ...addr, isDefault: false }));
            await updateDoc(userDocRef, { addresses: updatedAddresses });
        }
    }

    await updateDoc(userDocRef, {
        addresses: arrayUnion(newAddress)
    });

    return newAddress.id;
};

export const getAddresses = async (userId: string): Promise<ShippingAddress[]> => {
    const userDocRef = doc(db, usersCollection, userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        return data.addresses || [];
    }
    return [];
};

export const updateAddress = async (userId: string, addressId: string, addressData: Partial<Omit<ShippingAddress, 'id'>>): Promise<void> => {
    const userDocRef = doc(db, usersCollection, userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        let addresses = [...userData.addresses];

        if (addressData.isDefault) {
            addresses = addresses.map(addr => ({ ...addr, isDefault: false }));
        }

        const addressIndex = addresses.findIndex(a => a.id === addressId);
        if (addressIndex > -1) {
            addresses[addressIndex] = { ...addresses[addressIndex], ...addressData };
        }
        
        await updateDoc(userDocRef, { addresses });
    }
};

export const deleteAddress = async (userId: string, addressId: string): Promise<void> => {
    const userDocRef = doc(db, usersCollection, userId);
    const userDoc = await getDoc(userDocRef);
     if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        const updatedAddresses = userData.addresses.filter(addr => addr.id !== addressId);
        await updateDoc(userDocRef, { addresses: updatedAddresses });
    }
};

export const setDefaultAddress = async (userId: string, addressId: string): Promise<void> => {
    const userDocRef = doc(db, usersCollection, userId);
    const userDoc = await getDoc(userDocRef);
     if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        const updatedAddresses = userData.addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId
        }));
        await updateDoc(userDocRef, { addresses: updatedAddresses });
    }
};
