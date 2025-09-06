
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import type { Coupon } from "@/lib/types";
import Image from "next/image";
import { CouponForm } from "./coupon-form";
import { Badge } from "@/components/ui/badge";

interface OrderSummaryProps {
    subtotal: number;
    shippingCost: number;
    total: number;
    discount: number;
    appliedCoupon: Coupon | null;
    applyCoupon: (coupon: Coupon) => void;
    removeCoupon: () => void;
}

export function OrderSummary({ subtotal, shippingCost, total, discount, appliedCoupon, applyCoupon, removeCoupon }: OrderSummaryProps) {
    const { cart } = useCart();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                     {cart.map(item => (
                        <div key={item.productId} className="flex items-center justify-between text-sm">
                           <div className="flex items-center gap-3">
                             <div className="relative h-12 w-12 rounded-md overflow-hidden">
                                <Image 
                                    src={item.imageUrl || "https://picsum.photos/100/100"} 
                                    alt={item.name || 'product image'} 
                                    fill 
                                    className="object-cover"
                                />
                             </div>
                             <div>
                                <p className="font-medium truncate max-w-[150px]">{item.name}</p>
                                <p className="text-muted-foreground">Qty: {item.quantity}</p>
                             </div>
                           </div>
                           <p className="font-medium">₹{(item.price! * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}</span>
                    </div>
                     {appliedCoupon && (
                        <div className="flex justify-between text-primary">
                            <span className="text-muted-foreground">
                                Discount ({appliedCoupon.code})
                                <Badge variant="secondary" className="ml-2 cursor-pointer" onClick={removeCoupon}>Remove</Badge>
                            </span>
                            <span>- ₹{discount.toFixed(2)}</span>
                        </div>
                    )}
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                </div>
            </CardContent>
            <CardFooter>
                {!appliedCoupon && <CouponForm applyCoupon={applyCoupon} />}
            </CardFooter>
        </Card>
    );
}
