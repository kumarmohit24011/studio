
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
} from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile, getUserProfile, UserProfile, updateProfile } from '@/services/userService';
import { useState } from 'react';

interface AuthContextType {
  user: User | null | undefined;
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  error: Error | undefined;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<any>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<any>;
  signOut: () => void;
  updateUserProfile: (data: {displayName?: string, phoneNumber?: string}) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // The 'auth' object from firebase.ts is now guaranteed to be either a valid auth instance or undefined.
  const [user, loading, error] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const fetchUserProfile = async (currentUser: User | null) => {
      setProfileLoading(true);
      if(currentUser) {
          const profile = await getUserProfile(currentUser.uid);
          setUserProfile(profile);
      } else {
          setUserProfile(null);
      }
      setProfileLoading(false);
  }

  useEffect(() => {
    if (auth) { // Only run if firebase initialized
        fetchUserProfile(user);
    } else {
        setProfileLoading(false);
    }
  }, [user]);

  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase not initialized");
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userProfile = await getUserProfile(user.uid);
        if (!userProfile) {
            await createUserProfile(user);
        }
    } catch(e) {
        console.error("Error during Google sign-in:", e);
        throw e;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error("Firebase not initialized");
    return signInWithEmailAndPassword(auth, email, pass);
  }

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    if (!auth) throw new Error("Firebase not initialized");
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    await createUserProfile(userCred.user, name);
    return userCred;
  }

  const signOut = () => {
    if (!auth) return;
    firebaseSignOut(auth);
  };
  
  const updateUserProfile = async (data: {displayName?: string, phoneNumber?: string}) => {
      if (!user) throw new Error("User not authenticated");
      await updateProfile(user, data);
      await fetchUserProfile(user); // Re-fetch profile after update
  }

  const value = { user, userProfile, loading, profileLoading, error, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, updateUserProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
