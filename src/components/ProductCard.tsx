
"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { type Product } from "@/lib/placeholder-data";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useWishlist } from "@/hooks/use-wishlist";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { wishlist, toggleWishlist } = useWishlist();

  const isWishlisted = wishlist.includes(product.id);

  const formattedPrice = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price);
  const discountedPrice = product.tags?.includes('sale') 
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price * 0.8)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    toast({
      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      description: `${product.name} has been ${isWishlisted ? 'removed from' : 'added to'} your wishlist.`,
    })
  }

  return (
    <Card className="w-full max-w-sm overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <Link href={`/products/${product.id}`} className="block">
        <CardContent className="p-0">
          <div className="aspect-square relative">
            <Image
              src={product.images[0]}
              alt={product.name}
              layout="fill"
              objectFit="cover"
              className="hover:scale-105 transition-transform duration-300"
              data-ai-hint="jewelry"
            />
            {product.tags?.includes('new') && <Badge className="absolute top-3 right-3 bg-primary">New!</Badge>}
             <Button 
                size="icon" 
                variant="ghost" 
                className="absolute top-2 left-2 bg-white/50 hover:bg-white/80 rounded-full text-foreground"
                onClick={handleWishlistToggle}
              >
                <Heart className={cn("h-5 w-5", isWishlisted && "fill-destructive text-destructive")} />
              </Button>
          </div>
        </CardContent>
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <CardTitle className="text-lg font-headline mb-1"><Link href={`/products/${product.id}`}>{product.name}</Link></CardTitle>
        <CardDescription className="text-sm text-muted-foreground">{product.category}</CardDescription>
        <div className="mt-2 flex-grow">
          {discountedPrice ? (
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-bold text-accent">{discountedPrice}</p>
              <p className="text-sm text-muted-foreground line-through">{formattedPrice}</p>
            </div>
          ) : (
            <p className="text-lg font-bold text-foreground">{formattedPrice}</p>
          )}
        </div>
      </div>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" disabled={product.stock === 0} onClick={handleAddToCart}>
          {product.stock > 0 ? "Add to Cart" : "Sold Out"}
        </Button>
      </CardFooter>
    </Card>
  );
}
