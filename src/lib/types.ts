
import { Product } from "./placeholder-data";

export interface CartItem extends Product {
    quantity: number;
}

export interface ShippingAddress {
    id: string; // Add id for address management
    name: string;
    mobile: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
}

export interface OrderItem {
    productId: string;
    name: string; // Keep name and image for display purposes on order history
    image: string;
    quantity: number;
    price: number;
}


export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    shippingAddress: ShippingAddress; // Denormalize for easier display in admin panel
    orderStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    paymentStatus: 'Paid' | 'Pending' | 'Failed';
    razorpay_payment_id: string;
    razorpay_order_id: string;
    createdAt: number; // Firestore timestamp
}
