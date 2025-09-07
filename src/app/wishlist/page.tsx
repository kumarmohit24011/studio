
'use client';

import { useEffect, useState } from "react";
import { useWishlist } from "@/hooks/use-wishlist";
import { getProductsByIds } from "@/services/productService";
import type { Product } from "@/lib/types";
import { ProductCard } from "../products/_components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { wishlist: wishlistIds, wishlistLoading } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistIds.length > 0) {
        setLoading(true);
        const fetchedProducts = await getProductsByIds(wishlistIds);
        setProducts(fetchedProducts);
        setLoading(false);
      } else {
        setProducts([]);
        setLoading(false);
      }
    };

    if (!wishlistLoading) {
        fetchWishlistProducts();
    }
  }, [wishlistIds, wishlistLoading]);

  const isLoading = loading || wishlistLoading;

  if (isLoading) {
    return (
       <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-headline font-bold mb-8">Your Wishlist</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Heart className="mx-auto h-24 w-24 text-muted-foreground" />
        <h1 className="mt-6 text-3xl font-headline font-bold">Your Wishlist is Empty</h1>
        <p className="mt-2 text-muted-foreground">
          You haven't added any products to your wishlist yet.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">Explore Products</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-headline font-bold mb-8">Your Wishlist</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
