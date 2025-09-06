
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface HeroSectionData {
    headline: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    imageUrl: string;
    updatedAt?: any;
}

const siteContentRef = doc(db, 'siteContent', 'heroSection');

export const getHeroSection = async (): Promise<HeroSectionData> => {
    try {
        const docSnap = await getDoc(siteContentRef);
        if (docSnap.exists()) {
            return docSnap.data() as HeroSectionData;
        } else {
            // Return default data if it doesn't exist
            return {
                headline: 'Timeless Elegance, Redefined',
                subtitle: 'Discover our exclusive collection of handcrafted jewelry.',
                buttonText: 'Shop Now',
                buttonLink: '/products',
                imageUrl: 'https://picsum.photos/1800/1000'
            };
        }
    } catch (error) {
        console.error("Error fetching hero section data: ", error);
        // Return default data on error
        return {
            headline: 'Timeless Elegance, Redefined',
            subtitle: 'Discover our exclusive collection of handcrafted jewelry.',
            buttonText: 'Shop Now',
            buttonLink: '/products',
            imageUrl: 'https://picsum.photos/1800/1000'
        };
    }
};

export const updateHeroSection = async (data: Omit<HeroSectionData, 'imageUrl' | 'updatedAt'>, imageFile?: File): Promise<void> => {
    try {
        let imageUrl: string | undefined = undefined;

        if (imageFile) {
            const storageRef = ref(storage, `hero-images/${imageFile.name}-${Date.now()}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        const updateData: Partial<HeroSectionData> = {
            ...data,
            updatedAt: serverTimestamp()
        };

        if (imageUrl) {
            updateData.imageUrl = imageUrl;
        }

        await setDoc(siteContentRef, updateData, { merge: true });

    } catch (error) {
        console.error("Error updating hero section: ", error);
        throw error;
    }
};
