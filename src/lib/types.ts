
import { Product } from "./placeholder-data";

export interface CartItem extends Product {
    quantity: number;
}

export interface ShippingAddress {
    name: string;
    mobile: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
}

export interface Order {
    id: string;
    userId: string;
    items: CartItem[];
    totalAmount: number;
    shippingAddress: ShippingAddress;
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    razorpay_payment_id: string;
    razorpay_order_id: string;
    createdAt: number; // Firestore timestamp
}
