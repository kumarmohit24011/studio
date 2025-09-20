
'use server';

import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { triggerCacheRevalidation } from '@/lib/cache-client';

export interface HeroSectionData {
    headline: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    imageUrl: string;
    updatedAt?: any;
}

export interface PromoBannerData {
    headline: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    imageUrl: string;
    updatedAt?: any;
}

export interface ShippingSettingsData {
    defaultFee: number;
    freeShippingThreshold: number;
    updatedAt?: any;
}

export interface SiteContent {
    heroSection: HeroSectionData;
    promoBanner1: PromoBannerData;
    promoBanner2: PromoBannerData;
    shippingSettings: ShippingSettingsData;
}

export type PlainShippingSettingsData = Omit<ShippingSettingsData, 'updatedAt'> & { updatedAt?: string };

// This is a serializable version of the data safe for client components
export type PlainSiteContent = {
    heroSection: Omit<HeroSectionData, 'updatedAt'> & { updatedAt?: string };
    promoBanner1: Omit<PromoBannerData, 'updatedAt'> & { updatedAt?: string };
    promoBanner2: Omit<PromoBannerData, 'updatedAt'> & { updatedAt?: string };
    shippingSettings: PlainShippingSettingsData;
};


const siteContentRef = doc(db, 'siteContent', 'global');


export const updateHeroSection = async (data: Omit<HeroSectionData, 'imageUrl' | 'updatedAt'>, imageFile?: File): Promise<void> => {
    try {
        const updatePayload: Partial<SiteContent> = {};

        const updateData: any = {
            ...data,
            updatedAt: serverTimestamp()
        };

        if (imageFile) {
            const storageRef = ref(storage, `hero-images/${imageFile.name}-${Date.now()}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            updateData.imageUrl = await getDownloadURL(snapshot.ref);
        }

        updatePayload.heroSection = updateData;

        await setDoc(siteContentRef, updatePayload, { merge: true });
        await triggerCacheRevalidation('site-content');

    } catch (error) {
        console.error("Error in updateHeroSection:", error);
        throw error;
    }
};

export const updateShippingSettings = async (data: Omit<ShippingSettingsData, 'updatedAt'>): Promise<void> => {
    try {
        const updateData = {
            ...data,
            updatedAt: serverTimestamp()
        };
        await setDoc(siteContentRef, { shippingSettings: updateData }, { merge: true });
        await triggerCacheRevalidation('site-content');
    } catch (error) {
        console.error("Error updating shipping settings:", error);
        throw error;
    }
};
