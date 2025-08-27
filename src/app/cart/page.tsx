
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, loading } = useCart();
  const { toast } = useToast();

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
    toast({ title: 'Item removed from cart' });
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    } else {
        removeFromCart(productId);
    }
  };
  
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 150.0;
  const total = subtotal + shipping;

  if(loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading cart...</div>
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-headline text-center mb-8">Shopping Cart</h1>
      {cartItems.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Image src={item.images[0]} alt={item.name} width={80} height={80} className="rounded-md object-cover" />
                    <div>
                      <h2 className="font-semibold text-lg">{item.name}</h2>
                      <p className="text-muted-foreground">₹{item.price.toFixed(2)}</p>
                       <div className="flex items-center gap-2 mt-2">
                            <label htmlFor={`quantity-${item.id}`} className="text-sm">Qty:</label>
                            <Input 
                                type="number" 
                                id={`quantity-${item.id}`}
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10))}
                                className="w-20 h-8"
                                min="1"
                            />
                       </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemove(item.id)}>
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="p-6 border rounded-lg bg-secondary/30 sticky top-24">
              <h2 className="text-xl font-headline mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{shipping.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <Button asChild className="w-full mt-6">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-xl mb-4">Your cart is empty.</p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
