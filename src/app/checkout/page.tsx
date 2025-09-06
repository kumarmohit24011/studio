
'use client';

import { useCart } from "@/hooks/use-cart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { ShippingForm } from "./_components/shipping-form";
import { OrderSummary } from "./_components/order-summary";
import { useRazorpay } from "@/hooks/use-razorpay";
import { z } from "zod";
import { shippingSchema } from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Coupon } from "@/lib/types";
import { CreditCard } from "lucide-react";

export default function CheckoutPage() {
  const { cart, cartLoading } = useCart();
  const { user, authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { processPayment, isReady } = useRazorpay();
  const [shippingAddress, setShippingAddress] = useState<z.infer<typeof shippingSchema> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0), [cart]);
  const shippingCost = useMemo(() => (subtotal > 1000 ? 0 : 50), [subtotal]);

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
        return subtotal * (appliedCoupon.discountValue / 100);
    } else {
        return Math.min(subtotal, appliedCoupon.discountValue); // Ensure fixed discount isn't more than subtotal
    }
  }, [subtotal, appliedCoupon]);

  const total = useMemo(() => {
      const calculatedTotal = subtotal + shippingCost - discount;
      return calculatedTotal > 0 ? calculatedTotal : 0;
  }, [subtotal, shippingCost, discount]);

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast({ title: "Coupon Removed", description: "The discount has been removed from your order." });
  }

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
    const orderDetails = {
        couponCode: appliedCoupon?.code,
        discountAmount: discount,
    }
    await processPayment(total, shippingAddress, orderDetails);
    setIsSubmitting(false);
  }

  if (authLoading || cartLoading) {
    return (
        <div className="container mx-auto px-4 py-12">
            <Skeleton className="h-8 w-1/4 mb-8" />
            <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-8"><Skeleton className="h-96 w-full" /></div>
                <div className="lg:col-span-1"><Skeleton className="h-64 w-full" /></div>
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
      <div className="text-center mb-12">
          <h1 className="text-4xl font-headline font-bold">Checkout</h1>
          <p className="text-muted-foreground mt-2">Complete your order below.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        
        <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ShippingForm onFormSubmit={setShippingAddress} />
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="flex items-center justify-between p-4 rounded-md border bg-muted">
                    <div className="flex items-center gap-3">
                        <CreditCard className="h-6 w-6"/>
                        <p className="font-semibold">Pay with Razorpay</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Cards, UPI, Netbanking</p>
                 </div>
                 <Button 
                    className="w-full mt-6" 
                    size="lg" 
                    onClick={handlePayment} 
                    disabled={!shippingAddress || isSubmitting || !isReady}
                >
                    {isSubmitting ? "Processing..." : (isReady ? `Pay ₹${total.toFixed(2)}` : "Loading Payment...")}
                </Button>
              </CardContent>
            </Card>
        </div>

        <div className="sticky top-24">
            <OrderSummary 
                subtotal={subtotal} 
                shippingCost={shippingCost} 
                discount={discount}
                total={total}
                appliedCoupon={appliedCoupon}
                applyCoupon={setAppliedCoupon}
                removeCoupon={removeCoupon}
            />
        </div>
      </div>
    </div>
  );
}
