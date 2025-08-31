
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
import { createRazorpayOrder, saveOrder, applyCouponCode } from "./actions";
import { ShippingAddress } from "@/lib/types";
import { getAddresses, addAddress } from "@/services/addressService";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { PlusCircle, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Coupon } from "@/services/couponService";


interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    image?: string;
    order_id: string;
    handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
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


const AddressForm = ({ userId, onSave }: { userId: string, onSave: (newAddress: ShippingAddress) => void }) => {
    const [formData, setFormData] = useState<Omit<ShippingAddress, 'id' | 'isDefault'>>({
        name: '', mobile: '', line1: '', line2: '', city: '', state: '', pincode: ''
    });
    const { toast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    }

    const handleSubmit = async () => {
        if (!userId) return;
        try {
            for (const key in formData) {
                if (key !== 'line2' && !formData[key as keyof typeof formData]) {
                    toast({ variant: 'destructive', title: 'Please fill all required fields' });
                    return;
                }
            }
            const newAddressId = await addAddress(userId, { ...formData, isDefault: false });
            toast({ title: 'Address saved successfully' });
            onSave({ ...formData, id: newAddressId, isDefault: false });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to save address' });
        }
    }

    return (
        <>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Name</Label><Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="mobile" className="text-right">Mobile</Label><Input id="mobile" value={formData.mobile} onChange={handleChange} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="line1" className="text-right">Address Line 1</Label><Input id="line1" value={formData.line1} onChange={handleChange} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="line2" className="text-right">Line 2 (Opt)</Label><Input id="line2" value={formData.line2} onChange={handleChange} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="city" className="text-right">City</Label><Input id="city" value={formData.city} onChange={handleChange} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="state" className="text-right">State</Label><Input id="state" value={formData.state} onChange={handleChange} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="pincode" className="text-right">Pincode</Label><Input id="pincode" value={formData.pincode} onChange={handleChange} className="col-span-3" /></div>
            </div>
            <DialogClose asChild>
                <Button onClick={handleSubmit}>Save Address</Button>
            </DialogClose>
        </>
    )
}


export default function CheckoutPage() {
  const { cartItems, cartCount, loading: cartLoading, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);
  
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/checkout");
    }
    if (!cartLoading && cartCount === 0) {
      router.push("/products");
    }
  }, [user, authLoading, cartCount, cartLoading, router]);

  useEffect(() => {
    const fetchAddresses = async () => {
        if (user) {
            const addresses = await getAddresses(user.uid);
            setSavedAddresses(addresses);
            const defaultAddress = addresses.find(a => a.isDefault);
            if (defaultAddress) {
                setSelectedAddressId(defaultAddress.id);
            } else if (addresses.length > 0) {
                setSelectedAddressId(addresses[0].id);
            }
        }
    }
    fetchAddresses();
  }, [user]);

  const handleAddressSave = (newAddress: ShippingAddress) => {
    setIsAddressDialogOpen(false);
    setSavedAddresses(prev => [...prev, newAddress]);
    setSelectedAddressId(newAddress.id);
  }

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 150.0;
  
  useEffect(() => {
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'percentage') {
        setDiscount((subtotal * appliedCoupon.discountValue) / 100);
      } else {
        setDiscount(appliedCoupon.discountValue);
      }
    } else {
      setDiscount(0);
    }
  }, [appliedCoupon, subtotal]);

  const totalAmount = subtotal + shipping - discount;
  
  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const result = await applyCouponCode(couponCode, subtotal);
      if (result.success && result.coupon) {
        setAppliedCoupon(result.coupon);
        setDiscount(result.discountAmount || 0);
        toast({ title: 'Coupon Applied', description: `Discount of ₹${result.discountAmount?.toFixed(2)} applied.` });
      } else {
        setAppliedCoupon(null);
        setDiscount(0);
        setCouponCode("");
        toast({ variant: 'destructive', title: 'Invalid Coupon', description: result.message });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };


  const handlePayment = async () => {
    if (!user) {
        toast({variant: 'destructive', title: "You must be logged in to checkout"});
        return;
    }
    
    const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId);

    if (!selectedAddress) {
        toast({variant: 'destructive', title: "Please select or add a shipping address."});
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
            console.log("--- Payment Successful on client ---", response);
            console.log("--- Calling saveOrder server action ---");
            try {
              const saveResult = await saveOrder(
                  user.uid,
                  user.displayName || "Customer",
                  cartItems,
                  totalAmount,
                  selectedAddress.id,
                  {
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_order_id: response.razorpay_order_id,
                  },
                  appliedCoupon ? { code: appliedCoupon.code, discountAmount: discount } : undefined
              );

              if (saveResult.success) {
                  toast({ title: "Payment Successful!", description: "Your order has been placed." });
                  clearCart();
                  router.push("/profile?tab=orders");
              } else {
                  throw new Error(saveResult.message);
              }
            } catch (saveError: any) {
                 toast({ variant: 'destructive', title: "Order Save Error", description: `Your payment was successful, but we failed to save your order. Please contact support with Order ID: ${response.razorpay_order_id}`});
            }
        },
        prefill: {
          name: selectedAddress.name,
          email: user.email || '',
          contact: selectedAddress.mobile,
        },
        notes: {
            address: `${selectedAddress.line1}, ${selectedAddress.line2 || ''}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`
        },
        theme: {
          color: "#b92747",
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
      
      rzp.on('payment.failed', function (response: any){
          let errorMessage = "Payment failed. Please try again.";
          if (response && response.error && (response.error.description || response.error.message)) {
            errorMessage = response.error.description || response.error.message;
          }
          toast({ variant: 'destructive', title: "Payment Failed", description: errorMessage });
      });

    } catch (error) {
      console.error("Payment creation failed:", error);
      toast({ variant: 'destructive', title: "Payment Error", description: "Could not initiate payment. Please try again."})
    } finally {
        setIsProcessing(false);
    }
  };


  if (cartLoading || authLoading || !user) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading checkout...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-headline text-center mb-8">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-headline">Shipping Information</h2>
            <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline"><PlusCircle className="mr-2"/>Add New Address</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add a new shipping address</DialogTitle>
                    </DialogHeader>
                    <AddressForm userId={user.uid} onSave={handleAddressSave} />
                </DialogContent>
            </Dialog>
          </div>
          
          <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId} className="space-y-4">
              {savedAddresses.map(address => (
                  <Label key={address.id} htmlFor={address.id} className={cn("block p-4 border rounded-lg cursor-pointer", selectedAddressId === address.id && "border-primary ring-2 ring-primary")}>
                      <div className="flex justify-between items-start">
                           <div className="flex items-center space-x-4">
                                <RadioGroupItem value={address.id} id={address.id} />
                                <div>
                                    <p className="font-semibold">{address.name} {address.isDefault && <span className="text-xs text-muted-foreground">(Default)</span>}</p>
                                    <p className="text-sm text-muted-foreground">{address.line1}, {address.city}, {address.state} - {address.pincode}</p>
                                    <p className="text-sm text-muted-foreground">Mobile: {address.mobile}</p>
                                </div>
                           </div>
                      </div>
                  </Label>
              ))}
          </RadioGroup>
          {savedAddresses.length === 0 && (
            <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">You have no saved addresses.</p>
                <p className="text-muted-foreground text-sm">Add one to continue.</p>
            </div>
          )}

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
                <div className="flex items-center gap-2">
                    <Input 
                        placeholder="Coupon Code" 
                        value={couponCode} 
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={!!appliedCoupon}
                    />
                    <Button onClick={handleApplyCoupon} disabled={!!appliedCoupon || !couponCode}>Apply</Button>
                </div>
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
                {appliedCoupon && (
                   <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1"><Tag className="w-4 h-4"/> Coupon: {appliedCoupon.code}</span>
                    <span>-₹{discount.toFixed(2)}</span>
                   </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
            </div>
            <Button className="w-full mt-6" onClick={handlePayment} disabled={isProcessing || cartItems.length === 0 || !selectedAddressId}>
                {isProcessing ? "Processing..." : `Pay ₹${totalAmount.toFixed(2)}`}
            </Button>
        </div>
      </div>
    </div>
  );
}
