
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
}

export interface Category {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
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
    address?: string;
    photoURL?: string;
    isAdmin?: boolean;
    createdAt: any; // Firestore Timestamp
    wishlist: string[]; // Array of product IDs
    cart: CartItem[];
}


export interface Address {
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
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shippingAddress: Address;
    createdAt: any; // Firestore Timestamp
    updatedAt: any; // Firestore Timestamp
}
