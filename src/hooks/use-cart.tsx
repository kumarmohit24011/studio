
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './use-auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_LOCALSTORAGE_KEY = 'redbow_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);

  useEffect(() => {
    // Load cart from localStorage on initial client render
    try {
      const localCart = localStorage.getItem(CART_LOCALSTORAGE_KEY);
      if (localCart) {
        setCart(JSON.parse(localCart));
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
    }
    setCartLoading(false);
  }, []);

  useEffect(() => {
    // Sync localStorage whenever cart changes
    if (!cartLoading) {
      localStorage.setItem(CART_LOCALSTORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, cartLoading]);

  useEffect(() => {
    if (user) {
      // User is logged in, sync with Firestore
      setCartLoading(true);
      const cartRef = doc(db, 'carts', user.uid);
      
      const unsubscribe = onSnapshot(cartRef, (docSnap) => {
        if (docSnap.exists()) {
          const firestoreCart = docSnap.data().items as CartItem[];
          setCart(firestoreCart);
        } else {
          // No cart in firestore, if local cart exists, push it to firestore.
          const localCartData = localStorage.getItem(CART_LOCALSTORAGE_KEY);
          if (localCartData) {
              const localCart = JSON.parse(localCartData);
              if (localCart.length > 0) {
                  setDoc(cartRef, { items: localCart });
              }
          }
        }
        setCartLoading(false);
      });

      return () => unsubscribe();
    } else {
      // User is logged out, load from local storage
      const localCartData = localStorage.getItem(CART_LOCALSTORAGE_KEY);
      setCart(localCartData ? JSON.parse(localCartData) : []);
      setCartLoading(false);
    }
  }, [user]);

  const updateFirestoreCart = async (newCart: CartItem[]) => {
    if (user) {
      const cartRef = doc(db, 'carts', user.uid);
      await setDoc(cartRef, { items: newCart }, { merge: true });
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      let newCart;
      if (existingItem) {
        newCart = prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        newCart = [...prevCart, { ...product, quantity }];
      }
      updateFirestoreCart(newCart);
      return newCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.id !== productId);
      updateFirestoreCart(newCart);
      return newCart;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart => {
      const newCart = prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      updateFirestoreCart(newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    updateFirestoreCart([]);
  };
  
  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartLoading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
