
import { adminDb } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { doc, getDoc, Firestore } from 'firebase/firestore';
import { SiteContent, PromoBannerData, HeroSectionData, ShippingSettingsData } from '../siteContentService';


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

// Helper to convert Firestore Timestamps to serializable strings
const toPlainObject = (data: any): any => {
    if (!data) return null;
    const plain = { ...data };
    if (plain.updatedAt && typeof plain.updatedAt.toDate === 'function') {
        plain.updatedAt = plain.updatedAt.toDate().toISOString();
    }
    return plain;
};

export const getSiteContent = async (): Promise<SiteContent> => {
    const firestore = adminDb || db;
    if (!firestore) {
        console.error("Error fetching site content: Firestore is not initialized. Returning defaults.");
        return {
            heroSection: toPlainObject(defaultData.heroSection),
            promoBanner1: toPlainObject(defaultData.promoBanner1),
            promoBanner2: toPlainObject(defaultData.promoBanner2),
            shippingSettings: toPlainObject(defaultData.shippingSettings),
        };
    }
    const siteContentRef = doc(firestore, 'siteContent', 'global');
    
    try {
        const docSnap = await getDoc(siteContentRef);
        if (docSnap.exists()) {
            const data = docSnap.data() as SiteContent;
            // Ensure all fields have default values if they are missing
            return {
                heroSection: toPlainObject(data.heroSection || defaultData.heroSection),
                promoBanner1: toPlainObject(data.promoBanner1 || defaultData.promoBanner1),
                promoBanner2: toPlainObject(data.promoBanner2 || defaultData.promoBanner2),
                shippingSettings: toPlainObject(data.shippingSettings || defaultData.shippingSettings),
            };
        } else {
            console.log("Site content document doesn't exist, returning defaults.");
            // Return defaults with serialized dates
            return {
                heroSection: toPlainObject(defaultData.heroSection),
                promoBanner1: toPlainObject(defaultData.promoBanner1),
                promoBanner2: toPlainObject(defaultData.promoBanner2),
                shippingSettings: toPlainObject(defaultData.shippingSettings),
            };
        }
    } catch (error) {
        console.error("Error fetching site content, returning defaults: ", error);
        return {
            heroSection: toPlainObject(defaultData.heroSection),
            promoBanner1: toPlainObject(defaultData.promoBanner1),
            promoBanner2: toPlainObject(defaultData.promoBanner2),
            shippingSettings: toPlainObject(defaultData.shippingSettings),
        };
    }
};
