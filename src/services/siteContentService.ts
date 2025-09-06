
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

const defaultPromoBanner: PromoBannerData = {
    headline: 'Festive Discounts',
    subtitle: 'Up to 30% off on select necklaces',
    buttonText: 'Shop Now',
    buttonLink: '/products?category=Necklaces',
    imageUrl: 'https://picsum.photos/600/400',
    updatedAt: new Date()
};

const defaultData: SiteContent = {
    heroSection: {
        headline: 'Timeless Elegance, Redefined',
        subtitle: 'Discover our exclusive collection of handcrafted jewelry.',
        buttonText: 'Shop Now',
        buttonLink: '/products',
        imageUrl: 'https://picsum.photos/1800/1000',
        updatedAt: new Date()
    },
    promoBanner1: defaultPromoBanner,
    promoBanner2: {
        ...defaultPromoBanner,
        headline: 'Limited Time Offer',
        subtitle: 'Buy one, get one 50% off on wedding rings',
        buttonLink: '/products?category=Rings',
        imageUrl: 'https://picsum.photos/600/400?grayscale',
    },
    shippingSettings: {
        defaultFee: 50,
        freeShippingThreshold: 1000,
        updatedAt: new Date()
    }
};

export const getSiteContent = async (): Promise<SiteContent> => {
    try {
        const docSnap = await getDoc(siteContentRef);
        if (docSnap.exists()) {
            const data = docSnap.data() as SiteContent;
            // Ensure all fields have default values if they are missing
            return {
                heroSection: data.heroSection || defaultData.heroSection,
                promoBanner1: data.promoBanner1 || defaultData.promoBanner1,
                promoBanner2: data.promoBanner2 || defaultData.promoBanner2,
                shippingSettings: data.shippingSettings || defaultData.shippingSettings,
            };
        } else {
            console.log("Site content document doesn't exist, creating one with default data.");
            await setDoc(siteContentRef, {
                heroSection: { ...defaultData.heroSection, updatedAt: serverTimestamp() },
                promoBanner1: { ...defaultData.promoBanner1, updatedAt: serverTimestamp() },
                promoBanner2: { ...defaultData.promoBanner2, updatedAt: serverTimestamp() },
                shippingSettings: { ...defaultData.shippingSettings, updatedAt: serverTimestamp() }
            });
            return defaultData;
        }
    } catch (error) {
        console.error("Error fetching site content, returning defaults: ", error);
        return defaultData;
    }
};


export const updateHeroSection = async (data: Omit<HeroSectionData, 'imageUrl' | 'updatedAt'>, imageFile?: File): Promise<void> => {
    try {
        const updateData: any = {
            ...data,
            updatedAt: serverTimestamp()
        };

        if (imageFile) {
            const storageRef = ref(storage, `hero-images/${imageFile.name}-${Date.now()}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            updateData.imageUrl = await getDownloadURL(snapshot.ref);
        }

        await updateDoc(siteContentRef, { heroSection: updateData });

    } catch (error) {
        console.error("Error in updateHeroSection:", error);
        throw error;
    }
};

export const updatePromoBanner = async (bannerId: 'promoBanner1' | 'promoBanner2', data: Omit<PromoBannerData, 'imageUrl' | 'updatedAt'>, imageFile?: File): Promise<void> => {
    try {
        const updateData: any = {
            ...data,
            updatedAt: serverTimestamp()
        };

        if (imageFile) {
            const storageRef = ref(storage, `promo-images/${bannerId}-${imageFile.name}-${Date.now()}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            updateData.imageUrl = await getDownloadURL(snapshot.ref);
        }
        
        // Firestore requires dot notation for updating nested objects
        const firestoreUpdate: { [key: string]: any } = {};
        Object.keys(updateData).forEach(key => {
            firestoreUpdate[`${bannerId}.${key}`] = updateData[key];
        });

        await updateDoc(siteContentRef, firestoreUpdate);

    } catch (error) {
        console.error(`Error in updatePromoBanner for ${bannerId}:`, error);
        throw error;
    }
}

export const updateShippingSettings = async (data: Omit<ShippingSettingsData, 'updatedAt'>): Promise<void> => {
    try {
        const updateData = {
            ...data,
            updatedAt: serverTimestamp()
        };
        await updateDoc(siteContentRef, { shippingSettings: updateData });
    } catch (error) {
        console.error("Error updating shipping settings:", error);
        throw error;
    }
};
