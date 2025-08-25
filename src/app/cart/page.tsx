import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { products } from '@/lib/placeholder-data';
import Image from 'next/image';

export default function CartPage() {
  const cartItems = [
    { ...products[0], quantity: 1 },
    { ...products[2], quantity: 2 },
  ];
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 20.0;
  const total = subtotal + shipping;

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
                      <p className="text-muted-foreground">${item.price.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <p className='text-xl'>&times;</p>
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="p-6 border rounded-lg bg-secondary/30">
              <h2 className="text-xl font-headline mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full mt-6">Proceed to Checkout</Button>
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
