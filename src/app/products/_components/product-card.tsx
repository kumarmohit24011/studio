
'use client';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useToast } from "@/hooks/use-toast";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1);
    toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Card className="overflow-hidden group transition-shadow hover:shadow-lg">
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
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="rounded-full bg-background/70 hover:bg-background" onClick={handleToggleWishlist}>
                    <Heart className={`w-5 h-5 ${inWishlist ? 'text-red-500 fill-red-500' : 'text-foreground'}`}/>
                </Button>
            </div>
            {product.tags?.includes('sale') && <Badge variant="destructive" className="absolute top-2 left-2">Sale</Badge>}
          </div>
          <div className="p-4">
            <h3 className="font-headline text-lg truncate">{product.name}</h3>
            <div className="flex justify-between items-center mt-2">
                <p className="text-primary font-semibold text-lg">${product.price.toFixed(2)}</p>
                <Button variant="outline" size="icon" onClick={handleAddToCart}>
                    <ShoppingCart className="w-5 h-5" />
                </Button>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
