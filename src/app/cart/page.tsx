
'use client';

import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { Trash2, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartLoading } = useCart();

  const subtotal = cart.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);

  if (cartLoading) {
    return (
       <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-headline font-bold mb-8">Your Cart</h1>
            <div className="grid md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/4" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                           <Skeleton className="h-6 w-1/2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground" />
        <h1 className="mt-6 text-3xl font-headline font-bold">Your Cart is Empty</h1>
        <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild className="mt-6">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-headline font-bold mb-8">Your Cart</h1>
      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Cart Items ({cart.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4">
                    <div className="relative h-24 w-24 rounded-md overflow-hidden">
                      <Image
                        src={item.imageUrl || "https://picsum.photos/100/100"}
                        alt={item.name || "Product image"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-muted-foreground">₹{item.price?.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                        className="w-16 h-9"
                      />
                    </div>
                    <p className="font-semibold w-20 text-right">
                      ₹{((item.price || 0) * item.quantity).toFixed(2)}
                    </p>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.productId)}>
                      <Trash2 className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
