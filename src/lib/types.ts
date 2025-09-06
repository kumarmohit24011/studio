

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
    stock: number;
    tags?: string[];
    featured?: boolean;
    createdAt?: any;
    updatedAt?: any;
}

export interface Category {
    id: string;
    name: string;
    description: string;
    createdAt: any; // Firestore Timestamp
}

export interface CartItem { 
    productId: string; 
    quantity: number; 
    // Optional: store product details to avoid extra lookups
    name?: string;
    price?: number;
    imageUrl?: string;
}

export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    phone?: string;
    address?: StoredAddress;
    photoURL?: string;
    isAdmin?: boolean;
    createdAt: any; // Firestore Timestamp
    wishlist: string[]; // Array of product IDs
    cart: CartItem[];
}


export interface StoredAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface ShippingAddress {
      name: string;
      phone: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
}

export interface Order {
    id: string;
    userId: string;
    items: {
        productId: string;
        name: string;
        price: number;
        quantity: number;
    }[];
    totalAmount: number;
    orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'paid' | 'pending';
    shippingAddress: ShippingAddress;
    razorpayPaymentId?: string;
    couponCode?: string;
    discountAmount?: number;
    createdAt: any; // Firestore Timestamp
    updatedAt: any; // Firestore Timestamp
}

export interface Coupon {
    id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    isActive: boolean;
    createdAt: any; // Firestore Timestamp
}
