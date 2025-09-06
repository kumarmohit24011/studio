
'use client';

import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";
import { WishlistProvider } from "@/hooks/use-wishlist";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <CartProvider>
                <WishlistProvider>
                    {children}
                </WishlistProvider>
            </CartProvider>
        </AuthProvider>
    )
}
