
'use server';

import { cookies } from 'next/headers';
import { adminApp, adminAuth, adminStorage } from '@/lib/firebase-admin';
import { getUserProfile } from '@/services/userService';

/**
 * Securely uploads a promotional banner image to Firebase Storage.
 * This server action verifies admin privileges before proceeding.
 */
export async function uploadPromoImage(formData: FormData): Promise<{ imageUrl?: string; error?: string }> {
  try {
    // 1. Authenticate the user from the session cookie
    const sessionCookie = cookies().get('__session')?.value;
    if (!sessionCookie) {
      return { error: 'Authentication required. Please sign in.' };
    }
    
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decodedToken.uid;
    
    // 2. Verify if the user is an admin
    const userProfile = await getUserProfile(uid);
    if (!userProfile?.isAdmin) {
      return { error: 'Permission denied. You must be an admin to perform this action.' };
    }

    // 3. Process the file upload
    const imageFile = formData.get('image') as File | null;
    const bannerId = formData.get('bannerId') as string | null;

    if (!imageFile) {
      return { error: 'No image file provided.' };
    }
    if (!bannerId) {
        return { error: 'Banner ID is missing.'};
    }

    const bucket = adminStorage.bucket();
    const filePath = `content-images/${bannerId}-${Date.now()}-${imageFile.name}`;
    const file = bucket.file(filePath);

    // Convert file to buffer
    const fileBuffer = Buffer.from(await imageFile.arrayBuffer());

    // Upload the file buffer to Firebase Storage
    await file.save(fileBuffer, {
      metadata: {
        contentType: imageFile.type,
      },
    });

    // Make the file public and get its URL
    await file.makePublic();
    const publicUrl = file.publicUrl();

    return { imageUrl: publicUrl };

  } catch (error) {
    console.error('Server action uploadPromoImage failed:', error);
    if (error instanceof Error && (error.message.includes('Firebase ID token has expired.') || error.message.includes('Session cookie has been revoked'))) {
      return { error: 'Your session has expired. Please sign in again.' };
    }
    return { error: 'An unexpected error occurred during the upload. Please try again.' };
  }
}
