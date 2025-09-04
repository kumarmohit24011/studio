
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { createUserProfile, getUserProfile, UserProfile } from '@/services/userService';
import { doc, onSnapshot } from '@firebase/firestore';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  authLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        setUser(user);
        // The profile will be loaded by the snapshot listener below.
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (user && !authLoading) {
      const userRef = doc(db, 'users', user.uid);
      unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data() as UserProfile);
        } else {
          // This case might happen if the user document is deleted manually
          // Or if there's a delay in creation, though we've moved creation to signup.
          console.warn(`No profile found for user ${user.uid}, creating one.`);
          createUserProfile(user.uid, user.email || '', user.displayName || 'New User', user.photoURL || '');
        }
      });
    } else {
       setUserProfile(null);
    }
    return () => unsubscribe?.();
  }, [user, authLoading]);

  const handleAuthSuccess = (userCredential: any) => {
    router.push('/');
    return userCredential;
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const profile = await getUserProfile(result.user.uid);
      if (!profile) {
        await createUserProfile(result.user.uid, result.user.email!, result.user.displayName!, result.user.photoURL!);
      }
      handleAuthSuccess(result);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      handleAuthSuccess(result);
    } catch (error) {
      console.error("Error signing in with email: ", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      // Immediately create the user profile in Firestore
      await createUserProfile(userCredential.user.uid, email, displayName);
      handleAuthSuccess(userCredential);
    } catch (error) {
       console.error("Error signing up with email: ", error);
       throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const value = {
    user,
    userProfile,
    authLoading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
