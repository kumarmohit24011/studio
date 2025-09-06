'use client';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useToast } from "@/hooks/use-toast";
import { AddToCartButton } from "../[id]/_components/add-to-cart-button";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
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
    <Card className="overflow-hidden group transition-shadow hover:shadow-lg relative">
      <Link href={`/products/${product.id}`} className="block">
        <CardContent className="p-0">
          <div className="relative w-full aspect-square">
            <Image
              src={product.imageUrl || "https://picsum.photos/400/400"}
              alt={product.name}
              data-ai-hint="jewelry product"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {product.tags?.includes('sale') && <Badge variant="destructive" className="absolute top-2 left-2">Sale</Badge>}

            {/* Overlay for buttons on hover */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                <div className="flex gap-2">
                    <AddToCartButton product={product} size="icon" />
                    <Button variant="outline" size="icon" onClick={handleToggleWishlist} className="bg-background/80 hover:bg-background">
                        <Heart className={`w-5 h-5 ${inWishlist ? 'text-red-500 fill-red-500' : 'text-foreground'}`}/>
                    </Button>
                </div>
            </div>
          </div>
          <div className="p-4 text-center">
            <h3 className="font-headline text-lg truncate">{product.name}</h3>
            <p className="text-primary font-semibold text-lg mt-1">₹{product.price.toFixed(2)}</p>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
