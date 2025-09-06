
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
            console.log("Hero section document doesn't exist, returning default data.");
            return {
                headline: 'Timeless Elegance, Redefined',
                subtitle: 'Discover our exclusive collection of handcrafted jewelry.',
                buttonText: 'Shop Now',
                buttonLink: '/products',
                imageUrl: 'https://picsum.photos/1800/1000'
            };
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
        let newImageUrl: string | undefined = undefined;

        if (imageFile) {
            console.log("Image file provided. Uploading to Firebase Storage...");
            const storageRef = ref(storage, `hero-images/${imageFile.name}-${Date.now()}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            newImageUrl = await getDownloadURL(snapshot.ref);
            console.log("Image uploaded successfully. URL:", newImageUrl);
        } else {
            console.log("No new image file provided.");
        }

        const currentData = await getHeroSection();
        console.log("Current hero data from Firestore:", currentData);

        const updateData: HeroSectionData = {
            ...currentData, // Start with existing data
            ...data, // Overwrite with new text data
            updatedAt: serverTimestamp()
        };

        if (newImageUrl) {
            updateData.imageUrl = newImageUrl;
        }

        console.log("Final data to be saved to Firestore:", updateData);

        // Use setDoc with merge to create or update the document
        await setDoc(siteContentRef, updateData, { merge: true });
        console.log("--- updateHeroSection finished successfully ---");

    } catch (error) {
        console.error("!!! Error in updateHeroSection:", error);
        throw error;
    }
};
