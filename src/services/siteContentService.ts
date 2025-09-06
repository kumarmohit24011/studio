
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

// This is a serializable version of HeroSectionData safe for client components
export type PlainHeroData = Omit<HeroSectionData, 'updatedAt'> & { updatedAt?: string };


const siteContentRef = doc(db, 'siteContent', 'heroSection');

export const getHeroSection = async (): Promise<HeroSectionData> => {
    try {
        const docSnap = await getDoc(siteContentRef);
        if (docSnap.exists()) {
            return docSnap.data() as HeroSectionData;
        } else {
            console.log("Hero section document doesn't exist, creating one with default data.");
            const defaultData: HeroSectionData = {
                headline: 'Timeless Elegance, Redefined',
                subtitle: 'Discover our exclusive collection of handcrafted jewelry.',
                buttonText: 'Shop Now',
                buttonLink: '/products',
                imageUrl: 'https://picsum.photos/1800/1000',
                updatedAt: serverTimestamp()
            };
            await setDoc(siteContentRef, defaultData);
            return defaultData;
        }
    } catch (error) {
        console.error("Error fetching hero section data, returning defaults: ", error);
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
    console.log("--- Starting updateHeroSection ---");
    console.log("Received data:", data);
    console.log("Received image file:", imageFile ? imageFile.name : "No image file");

    try {
        const updateData: any = {
            ...data,
            updatedAt: serverTimestamp()
        };

        if (imageFile) {
            console.log("Image file provided. Uploading to Firebase Storage...");
            const storageRef = ref(storage, `hero-images/${imageFile.name}-${Date.now()}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            const newImageUrl = await getDownloadURL(snapshot.ref);
            console.log("Image uploaded successfully. URL:", newImageUrl);
            updateData.imageUrl = newImageUrl;
        } else {
            console.log("No new image file provided. Keeping existing image.");
        }


        console.log("Final data to be saved to Firestore:", updateData);
        await updateDoc(siteContentRef, updateData);
        console.log("--- updateHeroSection finished successfully ---");

    } catch (error) {
        console.error("!!! Error in updateHeroSection:", error);
        throw error;
    }
};
