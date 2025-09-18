
'use server';

import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

/**
 * Adds a new email address to the subscribers collection in Firestore.
 *
 * @param email The email address to add.
 * @returns An object with success status and a message.
 */
export const addSubscriber = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        // Log the invalid email attempt for monitoring purposes
        console.warn('[Subscription Attempt] Invalid email format provided', { email: email });
        return { success: false, message: 'Please provide a valid email address.' };
    }

    const emailId = email.toLowerCase();
    const subscriberRef = doc(db, 'subscribers', emailId);

    try {
        const docSnap = await getDoc(subscriberRef);

        if (docSnap.exists()) {
            return { success: true, message: 'This email is already subscribed. Thank you for being with us!' };
        }

        await setDoc(subscriberRef, {
            email: emailId,
            createdAt: serverTimestamp(),
        });

        return { success: true, message: 'Thank you for subscribing!' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(
            `[Subscription Error] Failed to add subscriber. Email: ${emailId}, Reason: ${errorMessage}`,
            {
                email: emailId,
                errorObject: JSON.stringify(error, Object.getOwnPropertyNames(error)),
            }
        );
        
        // Return a generic error message to the user for security.
        return { success: false, message: 'Could not subscribe. Please try again in a moment.' };
    }
};
