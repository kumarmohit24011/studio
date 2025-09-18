'use client';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { AddToCartButton } from "@/components/shared/add-to-cart-button";

export function ProductCard({ product }: { product: Product }) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Card className="overflow-hidden group border bg-card hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <Link href={`/products/${product.id}`} className="block flex flex-col h-full">
        <div className="relative w-full aspect-square overflow-hidden">
             {product.tags?.includes('hot-selling') && (
                <Badge variant="destructive" className="absolute top-2 left-2 z-10">Hot Selling</Badge>
            )}
            <Image
              src={product.imageUrl || "https://picsum.photos/400/400"}
              alt={product.name}
              data-ai-hint="jewelry product"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-2 right-2 z-10">
                <Button 
                    variant="secondary" 
                    size="icon" 
                    onClick={handleToggleWishlist} 
                    className="rounded-full h-9 w-9 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-background"
                    aria-label="Toggle Wishlist"
                >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'text-red-500 fill-red-500' : 'text-foreground'}`}/>
                </Button>
            </div>
        </div>
        <CardContent className="p-4 flex-grow flex flex-col">
            <h3 className="font-semibold text-base text-foreground truncate flex-grow">{product.name}</h3>
            <div className="flex items-center gap-2 mt-2">
              {product.discountedPrice ? (
                <>
                  <p className="text-primary font-bold text-lg">Rs.{product.price.toFixed(2)}</p>
                  <p className="text-muted-foreground line-through text-sm">Rs.{product.discountedPrice.toFixed(2)}</p>
                </>
              ) : (
                <p className="text-primary font-bold text-lg">Rs.{product.price.toFixed(2)}</p>
              )}
            </div>
        </CardContent>
      </Link>
      <div className="p-4 pt-0">
        <AddToCartButton product={product} size="sm" className="w-full" />
      </div>
    </Card>
  );
}
