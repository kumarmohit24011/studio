
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './use-auth';
import * as wishlistService from '@/services/wishlistService';

interface WishlistContextType {
  wishlist: string[]; // Array of product IDs
  toggleWishlist: (productId: string) => void;
  loading: boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeWishlist = async () => {
      setLoading(true);
      if (user) {
        const remoteWishlist = await wishlistService.getWishlist(user.uid);
        setWishlist(remoteWishlist);
      } else if (!authLoading) {
        // Handle guest user wishlist if needed (e.g., using localStorage)
        // For now, wishlist is for logged-in users only.
        setWishlist([]);
      }
      setLoading(false);
    };

    initializeWishlist();
  }, [user, authLoading]);

  const toggleWishlist = useCallback(async (productId: string) => {
    if (!user) {
      // Maybe prompt user to log in
      console.log("User must be logged in to have a wishlist.");
      return;
    }

    setWishlist(prevWishlist => {
      const isWishlisted = prevWishlist.includes(productId);
      if (isWishlisted) {
        // Optimistically remove from UI
        wishlistService.removeFromWishlist(user.uid, productId);
        return prevWishlist.filter(id => id !== productId);
      } else {
        // Optimistically add to UI
        wishlistService.addToWishlist(user.uid, productId);
        return [...prevWishlist, productId];
      }
    });
  }, [user]);

  const wishlistCount = wishlist.length;

  const value = {
    wishlist,
    toggleWishlist,
    loading,
    wishlistCount,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
