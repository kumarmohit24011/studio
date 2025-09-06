
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
                <div className="absolute top-2 right-2">
                    <Button variant="ghost" size="icon" className="rounded-full bg-background/70 hover:bg-background" onClick={handleToggleWishlist}>
                        <Heart className={`w-5 h-5 ${inWishlist ? 'text-red-500 fill-red-500' : 'text-foreground'}`}/>
                    </Button>
                </div>
                {product.tags?.includes('sale') && <Badge variant="destructive" className="absolute top-2 left-2">Sale</Badge>}
            </div>
            <div className="p-4 text-center">
                <h3 className="font-headline text-lg truncate">{product.name}</h3>
                <p className="text-primary font-semibold text-lg mt-1">₹{product.price.toFixed(2)}</p>
            </div>
            </CardContent>
        </Link>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <AddToCartButton product={product} className="w-full" />
        </div>
    </Card>
  );
}
