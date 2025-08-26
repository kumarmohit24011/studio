
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

  const mergeCarts = useCallback(async (localCart: CartItem[], userId: string) => {
    const remoteCart = await cartService.getCart(userId);
    const mergedCart = [...remoteCart];

    localCart.forEach(localItem => {
      const remoteItemIndex = mergedCart.findIndex(item => item.id === localItem.id);
      if (remoteItemIndex !== -1) {
        mergedCart[remoteItemIndex].quantity += localItem.quantity;
      } else {
        mergedCart.push(localItem);
      }
    });

    await cartService.updateCart(userId, mergedCart);
    return mergedCart;
  }, []);

  useEffect(() => {
    const initializeCart = async () => {
      setLoading(true);
      if (user) {
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
        if (localCart.length > 0) {
          const merged = await mergeCarts(localCart, user.uid);
          setCartItems(merged);
          localStorage.removeItem('cart');
        } else {
          const remoteCart = await cartService.getCart(user.uid);
          setCartItems(remoteCart);
        }
      } else if (!authLoading) {
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
        setCartItems(localCart);
      }
      setLoading(false);
    };

    initializeCart();
  }, [user, authLoading, mergeCarts]);

  const addToCart = async (product: Product, quantity = 1) => {
    const newItem: CartItem = { ...product, quantity };
    let updatedCart: CartItem[];

    if (user) {
        await cartService.addItemToCart(user.uid, newItem);
        updatedCart = await cartService.getCart(user.uid);
    } else {
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
        const existingItemIndex = currentCart.findIndex(item => item.id === product.id);

        if (existingItemIndex !== -1) {
            currentCart[existingItemIndex].quantity += quantity;
        } else {
            currentCart.push(newItem);
        }
        localStorage.setItem('cart', JSON.stringify(currentCart));
        updatedCart = currentCart;
    }
    setCartItems(updatedCart);
  };

  const removeFromCart = async (productId: string) => {
    let updatedCart: CartItem[];
     if (user) {
        await cartService.removeItemFromCart(user.uid, productId);
        updatedCart = await cartService.getCart(user.uid);
     } else {
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
        updatedCart = currentCart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
     }
     setCartItems(updatedCart);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    let updatedCart: CartItem[];
    if (user) {
        await cartService.updateItemQuantity(user.uid, productId, quantity);
        updatedCart = await cartService.getCart(user.uid);
    } else {
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
        const itemIndex = currentCart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            if (quantity <= 0) {
                updatedCart = currentCart.filter(item => item.id !== productId);
            } else {
                currentCart[itemIndex].quantity = quantity;
                updatedCart = currentCart;
            }
            localStorage.setItem('cart', JSON.stringify(updatedCart));
        } else {
            updatedCart = currentCart;
        }
    }
    setCartItems(updatedCart);
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
