
"use client";

import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { createRazorpayOrder, saveOrder } from "./actions";
import { ShippingAddress } from "@/lib/types";

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    image?: string;
    order_id: string;
    handler: (response: any) => void;
    prefill: {
        name: string;
        email: string;
        contact: string;
    };
    notes?: {
        [key: string]: string;
    };
    theme?: {
        color: string;
    };
}

declare const Razorpay: new (options: RazorpayOptions) => any;

export default function CheckoutPage() {
  const { cartItems, cartCount, loading: cartLoading, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const [address, setAddress] = useState<ShippingAddress>({
    name: "",
    mobile: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/checkout");
    }
    if (!cartLoading && cartCount === 0) {
      router.push("/products");
    }
  }, [user, authLoading, cartCount, cartLoading, router]);

  useEffect(() => {
    if (user) {
        setAddress(prev => ({...prev, name: user.displayName || '', mobile: user.phoneNumber || ''}));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.id]: e.target.value });
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 150.0;
  const totalAmount = subtotal + shipping;

  const handlePayment = async () => {
    if (!user) {
        toast({variant: 'destructive', title: "You must be logged in to checkout"});
        return;
    }

    // Basic validation
    if (!address.name || !address.mobile || !address.line1 || !address.city || !address.state || !address.pincode) {
        toast({variant: 'destructive', title: "Please fill all required shipping fields."});
        return;
    }

    setIsProcessing(true);
    
    try {
      const order = await createRazorpayOrder(totalAmount);
      
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount,
        currency: order.currency,
        name: "Redbow Jewelry",
        description: "Transaction for your beautiful jewelry",
        order_id: order.id,
        handler: async (response) => {
            try {
              const saveResult = await saveOrder(
                  user.uid,
                  cartItems,
                  totalAmount,
                  address,
                  {
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_order_id: response.razorpay_order_id,
                  }
              );

              if (saveResult.success) {
                  toast({ title: "Payment Successful!", description: "Your order has been placed." });
                  clearCart();
                  router.push("/profile");
              } else {
                  throw new Error(saveResult.message);
              }
            } catch (saveError: any) {
                 toast({ variant: 'destructive', title: "Order Save Error", description: `Your payment was successful, but we failed to save your order. Please contact support with Order ID: ${response.razorpay_order_id}`});
            }
        },
        prefill: {
          name: address.name,
          email: user.email || '',
          contact: address.mobile,
        },
        notes: {
            address: `${address.line1}, ${address.line2}, ${address.city}, ${address.state} - ${address.pincode}`
        },
        theme: {
          color: "#b92747",
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
      
      rzp.on('payment.failed', function (response: any){
          toast({ variant: 'destructive', title: "Payment Failed", description: response.error.description });
      });

    } catch (error) {
      console.error("Payment creation failed:", error);
      toast({ variant: 'destructive', title: "Payment Error", description: "Could not initiate payment. Please try again."})
    } finally {
        setIsProcessing(false);
    }
  };


  if (cartLoading || authLoading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading checkout...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-headline text-center mb-8">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-headline mb-4">Shipping Information</h2>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={address.name} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input id="mobile" value={address.mobile} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="line1">Address Line 1</Label>
              <Input id="line1" value={address.line1} onChange={handleChange} required />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="line2">Address Line 2 (Optional)</Label>
              <Input id="line2" value={address.line2} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={address.city} onChange={handleChange} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={address.state} onChange={handleChange} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" value={address.pincode} onChange={handleChange} required />
                </div>
            </div>
          </div>
        </div>
        <div className="p-6 border rounded-lg bg-secondary/30 self-start sticky top-24">
            <h2 className="text-2xl font-headline mb-4">Your Order</h2>
             <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Image src={item.images[0]} alt={item.name} width={50} height={50} className="rounded-md object-cover" />
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <Separator className="my-4"/>
             <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>₹{shipping.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
            </div>
            <Button className="w-full mt-6" onClick={handlePayment} disabled={isProcessing || cartItems.length === 0}>
                {isProcessing ? "Processing..." : `Pay ₹${totalAmount.toFixed(2)}`}
            </Button>
        </div>
      </div>
    </div>
  );
}
