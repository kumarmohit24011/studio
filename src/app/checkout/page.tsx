
'use client';

import { useCart } from "@/hooks/use-cart";
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
import { CreditCard, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function CheckoutPage() {
  const { cart, cartLoading } = useCart();
  const { user, userProfile, authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { processPayment, isReady } = useRazorpay();
  const [shippingAddress, setShippingAddress] = useState<z.infer<typeof shippingSchema> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/checkout');
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

  if (authLoading || cartLoading || !userProfile) {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
                <div><Skeleton className="h-[500px] w-full" /></div>
            </div>
        </div>
    );
  }

  if (cart.length === 0 && !cartLoading) {
     router.push('/products');
     return null;
  }

  return (
    <div className="container mx-auto px-4">
        <main className="grid lg:grid-cols-2">
            <div className="py-12 lg:pr-12">
                <h1 className="text-3xl font-headline font-bold mb-2">Redbow</h1>
                 <p className="text-muted-foreground mb-8">Complete your purchase</p>
                
                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                        <div className="flex items-center gap-3 p-4 rounded-md border bg-muted/50">
                            <Mail className="h-5 w-5 text-muted-foreground"/>
                            <span>{userProfile.email}</span>
                        </div>
                    </section>

                    <Separator/>
                    
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                        <ShippingForm onFormSubmit={setShippingAddress} />
                    </section>

                </div>


            </div>
            
            <div className="py-12 lg:pl-12 lg:border-l lg:bg-muted/30">
                 <div className="sticky top-20">
                    <OrderSummary 
                        subtotal={subtotal} 
                        shippingCost={shippingCost} 
                        discount={discount}
                        total={total}
                        appliedCoupon={appliedCoupon}
                        applyCoupon={setAppliedCoupon}
                        removeCoupon={removeCoupon}
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
        </main>
    </div>
  );
}
