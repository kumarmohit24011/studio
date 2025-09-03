
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './use-auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';
import { useToast } from './use-toast';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_LOCALSTORAGE_KEY = 'redbow_wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  useEffect(() => {
    // Load wishlist from localStorage on initial client render
    try {
      const localWishlist = localStorage.getItem(WISHLIST_LOCALSTORAGE_KEY);
      if (localWishlist) {
        setWishlist(JSON.parse(localWishlist));
      }
    } catch (error) {
      console.error("Failed to parse wishlist from localStorage", error);
    }
    setWishlistLoading(false);
  }, []);

  useEffect(() => {
    // Sync localStorage whenever wishlist changes
    if (!wishlistLoading) {
      localStorage.setItem(WISHLIST_LOCALSTORAGE_KEY, JSON.stringify(wishlist));
    }
  }, [wishlist, wishlistLoading]);
  
  useEffect(() => {
    if (user) {
      // User is logged in, sync with Firestore
      setWishlistLoading(true);
      const wishlistRef = doc(db, 'wishlists', user.uid);

      const unsubscribe = onSnapshot(wishlistRef, (docSnap) => {
        if (docSnap.exists()) {
          setWishlist(docSnap.data().items as Product[]);
        } else {
            const localWishlistData = localStorage.getItem(WISHLIST_LOCALSTORAGE_KEY);
            if (localWishlistData) {
                const localWishlist = JSON.parse(localWishlistData);
                if (localWishlist.length > 0) {
                    setDoc(wishlistRef, { items: localWishlist });
                }
            }
        }
        setWishlistLoading(false);
      });

      return () => unsubscribe();
    } else {
      // User is logged out, load from local storage
      const localWishlistData = localStorage.getItem(WISHLIST_LOCALSTORAGE_KEY);
      setWishlist(localWishlistData ? JSON.parse(localWishlistData) : []);
      setWishlistLoading(false);
    }
  }, [user]);

  const updateFirestoreWishlist = async (newWishlist: Product[]) => {
    if (user) {
      const wishlistRef = doc(db, 'wishlists', user.uid);
      await setDoc(wishlistRef, { items: newWishlist }, { merge: true });
    }
  };

  const addToWishlist = (product: Product) => {
    setWishlist(prevWishlist => {
      if (prevWishlist.some(item => item.id === product.id)) {
        return prevWishlist;
      }
      const newWishlist = [...prevWishlist, product];
      updateFirestoreWishlist(newWishlist);
      toast({ title: "Added to Wishlist", description: `${product.name} has been added to your wishlist.` });
      return newWishlist;
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prevWishlist => {
      const product = prevWishlist.find(item => item.id === productId);
      const newWishlist = prevWishlist.filter(item => item.id !== productId);
      updateFirestoreWishlist(newWishlist);
      if (product) {
        toast({ title: "Removed from Wishlist", description: `${product.name} has been removed from your wishlist.` });
      }
      return newWishlist;
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };
  
  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    wishlistLoading,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
