
"use client";

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile, getUserProfile } from '@/services/userService';

interface AuthContextType {
  user: User | null | undefined;
  loading: boolean;
  error: Error | undefined;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<any>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<any>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, loading, error] = useAuthState(auth);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        // Check if user profile exists, if not create one
        const userProfile = await getUserProfile(user.uid);
        if (!userProfile) {
            await createUserProfile(user.uid, {
                name: user.displayName || '',
                email: user.email || '',
                phone: user.phoneNumber || '',
                createdAt: Date.now(),
                addresses: [],
                cart: [],
                wishlist: []
            });
        }
    } catch(e) {
        console.error("Error during Google sign-in:", e);
        throw e;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  }

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCred.user, { displayName: name });
    
    // Create user profile in Firestore
    await createUserProfile(userCred.user.uid, {
        name: name,
        email: email,
        phone: '',
        createdAt: Date.now(),
        addresses: [],
        cart: [],
        wishlist: []
    });

    return userCred;
  }

  const signOut = () => {
    firebaseSignOut(auth);
  };

  const value = { user, loading, error, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
