
'use client';
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";

export function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(product, 1);
    toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`
    });
  };

  return (
    <Button onClick={handleAddToCart} size="lg">Add to Cart</Button>
  );
}
