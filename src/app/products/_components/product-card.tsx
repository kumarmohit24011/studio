
'use client';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { AddToCartButton } from "../[id]/_components/add-to-cart-button";

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
    <Card className="overflow-hidden group transition-shadow hover:shadow-lg flex flex-col">
      <Link href={`/products/${product.id}`} className="block flex flex-col h-full">
        <CardContent className="p-0 flex-grow flex flex-col">
          <div className="relative w-full aspect-square">
            <Image
              src={product.imageUrl || "https://picsum.photos/400/400"}
              alt={product.name}
              data-ai-hint="jewelry product"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {product.tags?.includes('sale') && <Badge variant="destructive" className="absolute top-2 left-2 z-10">Sale</Badge>}
             <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleToggleWishlist} 
                    className="bg-background/60 hover:bg-background/90 rounded-full h-8 w-8"
                    aria-label="Toggle Wishlist"
                >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'text-red-500 fill-red-500' : 'text-foreground'}`}/>
                </Button>
                <AddToCartButton product={product} size="icon" className="bg-background/60 hover:bg-background/90 rounded-full h-8 w-8" />
            </div>
          </div>

          <div className="p-4 text-center mt-auto flex-grow flex flex-col justify-center">
            <CardTitle as="h3" className="font-headline text-lg truncate">{product.name}</CardTitle>
             <p className="text-primary font-semibold text-lg mt-2">₹{product.price.toFixed(2)}</p>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
