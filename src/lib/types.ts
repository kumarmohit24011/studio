
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

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    isAdmin?: boolean;
    addresses?: Address[];
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
