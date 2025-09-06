

'use client';

import { useCart } from "@/hooks/use-cart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShippingForm } from "./_components/shipping-form";
import { OrderSummary } from "./_components/order-summary";
import { useRazorpay } from "@/hooks/use-razorpay";
import { z } from "zod";
import { shippingSchema } from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ShippingAddress } from "@/lib/types";


export default function CheckoutPage() {
  const { cart, cartLoading } = useCart();
  const { user, authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { processPayment, isReady } = useRazorpay();
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  // Simple shipping calculation for now
  const shippingCost = subtotal > 1000 ? 0 : 50; 
  const total = subtotal + shippingCost;
  
  const handlePayment = async () => {
    if (!shippingAddress) {
      toast({
        variant: "destructive",
        title: "Shipping Address Required",
        description: "Please fill out and save your shipping address.",
      });
      return;
    }
    setIsSubmitting(true);
    await processPayment(total, shippingAddress);
    setIsSubmitting(false);
  }

  if (authLoading || cartLoading) {
    return (
        <div className="container mx-auto px-4 py-12">
            <Skeleton className="h-8 w-1/4 mb-8" />
            <div className="grid lg:grid-cols-5 gap-12 items-start">
                <div className="lg:col-span-3"><Skeleton className="h-96 w-full" /></div>
                <div className="lg:col-span-2"><Skeleton className="h-64 w-full" /></div>
            </div>
        </div>
    );
  }

  if (cart.length === 0 && !cartLoading) {
     router.push('/products');
     return null; // or a message, but redirecting is better
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-headline font-bold mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-5 gap-12 items-start">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ShippingForm onFormSubmit={setShippingAddress} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
            <div className="sticky top-24">
                <OrderSummary 
                    subtotal={subtotal} 
                    shippingCost={shippingCost} 
                    total={total} 
                />
                <Button 
                    className="w-full mt-6" 
                    size="lg" 
                    onClick={handlePayment} 
                    disabled={!shippingAddress || isSubmitting || !isReady}
                >
                    {isSubmitting ? "Processing..." : (isReady ? `Pay ₹${total.toFixed(2)}` : "Loading Payment...")}
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
