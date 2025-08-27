
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

  const fetchUserCart = useCallback(async (uid: string) => {
    setLoading(true);
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
    let finalCart;
    if (localCart.length > 0) {
      const remoteCart = await cartService.getCart(uid);
      const mergedCart = [...remoteCart];

      localCart.forEach(localItem => {
        const remoteItemIndex = mergedCart.findIndex(item => item.id === localItem.id);
        if (remoteItemIndex !== -1) {
          // If item exists, sum quantities. You might want different logic here.
          mergedCart[remoteItemIndex].quantity += localItem.quantity;
        } else {
          mergedCart.push(localItem);
        }
      });
      await cartService.updateCart(uid, mergedCart);
      finalCart = mergedCart;
      localStorage.removeItem('cart');
    } else {
      finalCart = await cartService.getCart(uid);
    }
    setCartItems(finalCart);
    setLoading(false);
  }, []);

  const loadGuestCart = useCallback(() => {
    setLoading(true);
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
    setCartItems(localCart);
    setLoading(false);
  }, []);

  useEffect(() => {
    // This effect runs once on mount and handles cart initialization
    if (authLoading) {
      // If authentication is still loading, we wait.
      setLoading(true);
      return;
    }

    if (user) {
      // If user is logged in, fetch their cart
      fetchUserCart(user.uid);
    } else {
      // If no user, load from local storage
      loadGuestCart();
    }
  }, [user, authLoading, fetchUserCart, loadGuestCart]);

  const addToCart = async (product: Product, quantity = 1) => {
    setCartItems(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === product.id);
      let newCart: CartItem[];

      if (existingItemIndex !== -1) {
        newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
      } else {
        newCart = [...prevCart, { ...product, quantity }];
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
     setCartItems(prevCart => {
        const newCart = prevCart.filter(item => item.id !== productId);
        if (user) {
            cartService.updateCart(user.uid, newCart);
        } else {
            localStorage.setItem('cart', JSON.stringify(newCart));
        }
        return newCart;
     });
  };

  const updateQuantity = async (productId: string, quantity: number) => {
     setCartItems(prevCart => {
        const itemIndex = prevCart.findIndex(item => item.id === productId);
        if (itemIndex === -1) return prevCart;

        let newCart;
        if (quantity <= 0) {
            newCart = prevCart.filter(item => item.id !== productId);
        } else {
            newCart = [...prevCart];
            newCart[itemIndex] = { ...newCart[itemIndex], quantity };
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
    if (user) {
        await cartService.updateCart(user.uid, []);
    } else {
        localStorage.removeItem('cart');
    }
    setCartItems([]);
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
