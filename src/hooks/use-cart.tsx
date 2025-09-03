
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './use-auth';
import { Product } from '@/lib/placeholder-data';
import { CartItem } from '@/lib/types';
import * as cartService from '@/services/cartService';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  loading: boolean;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Effect to handle cart synchronization
  useEffect(() => {
    const handleCartSync = async () => {
      setLoading(true);

      // Wait until Firebase auth state is resolved
      if (authLoading) {
        return;
      }

      if (user) {
        // User is logged in, sync local cart to remote
        const localCartString = localStorage.getItem('cart');
        const localCart = localCartString ? JSON.parse(localCartString) as CartItem[] : [];

        if (localCart.length > 0) {
          // If there's a local cart, overwrite remote cart with it.
          await cartService.updateCart(user.uid, localCart);
          setCartItems(localCart);
          localStorage.removeItem('cart'); // Clear local cart after sync
        } else {
          // No local cart, just load the remote cart
          const remoteCart = await cartService.getCart(user.uid);
          setCartItems(remoteCart);
        }
      } else {
        // User is a guest, load cart from localStorage
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
        setCartItems(localCart);
      }
      
      setLoading(false);
    };

    handleCartSync();
  }, [user, authLoading]);


  const addToCart = async (product: Product, quantity = 1) => {
    setCartItems(prevItems => {
        const newCart = [...prevItems];
        const existingItemIndex = newCart.findIndex(item => item.id === product.id);

        if (existingItemIndex !== -1) {
            newCart[existingItemIndex].quantity += quantity;
        } else {
            newCart.push({ ...product, quantity });
        }
        
        if (user) {
            cartService.updateCart(user.uid, newCart);
        } else {
            localStorage.setItem('cart', JSON.stringify(newCart));
        }

        return newCart;
    });
  };

  const removeFromCart = async (productId: string) => {
    setCartItems(prevItems => {
        const newCart = prevItems.filter(item => item.id !== productId);
        if (user) {
            cartService.updateCart(user.uid, newCart);
        } else {
            localStorage.setItem('cart', JSON.stringify(newCart));
        }
        return newCart;
    });
  };

  const updateQuantity = async (productId: string, quantity: number) => {
     setCartItems(prevItems => {
        let newCart;
        if (quantity <= 0) {
            newCart = prevItems.filter(item => item.id !== productId);
        } else {
            newCart = prevItems.map(item => 
                item.id === productId ? { ...item, quantity } : item
            );
        }

        if (user) {
            cartService.updateCart(user.uid, newCart);
        } else {
            localStorage.setItem('cart', JSON.stringify(newCart));
        }
        return newCart;
    });
  };

  const clearCart = async () => {
    setCartItems([]);
    if (user) {
        await cartService.updateCart(user.uid, []);
    } else {
        localStorage.removeItem('cart');
    }
  }

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loading,
    cartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
