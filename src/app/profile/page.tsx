
"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/lib/placeholder-data";
import { ProductCard } from "@/components/ProductCard";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWishlist } from "@/hooks/use-wishlist";
import { getProducts } from "@/services/productService";
import { getOrdersForUser } from "@/services/orderService";
import { getAddresses, addAddress, deleteAddress, setDefaultAddress } from "@/services/addressService";
import { Order, ShippingAddress } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { PlusCircle, Trash, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const AddressForm = ({ userId, onSave, address }: { userId: string, onSave: () => void, address?: ShippingAddress }) => {
    const [formData, setFormData] = useState({
        name: address?.name || '',
        mobile: address?.mobile || '',
        line1: address?.line1 || '',
        line2: address?.line2 || '',
        city: address?.city || '',
        state: address?.state || '',
        pincode: address?.pincode || '',
    });
    const { toast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    }

    const handleSubmit = async () => {
        if (!userId) return;
        try {
            // Basic validation
            for (const key in formData) {
                if (key !== 'line2' && !formData[key as keyof typeof formData]) {
                    toast({ variant: 'destructive', title: 'Please fill all fields' });
                    return;
                }
            }
            await addAddress(userId, formData);
            toast({ title: 'Address saved successfully' });
            onSave();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to save address' });
        }
    }

    return (
        <>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mobile" className="text-right">Mobile</Label>
                    <Input id="mobile" value={formData.mobile} onChange={handleChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="line1" className="text-right">Address Line 1</Label>
                    <Input id="line1" value={formData.line1} onChange={handleChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="line2" className="text-right">Line 2</Label>
                    <Input id="line2" value={formData.line2} onChange={handleChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="city" className="text-right">City</Label>
                    <Input id="city" value={formData.city} onChange={handleChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="state" className="text-right">State</Label>
                    <Input id="state" value={formData.state} onChange={handleChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pincode" className="text-right">Pincode</Label>
                    <Input id="pincode" value={formData.pincode} onChange={handleChange} className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSubmit}>Save Address</Button>
            </DialogFooter>
        </>
    )
}

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { wishlist, loading: wishlistLoading } = useWishlist();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

  const fetchUserData = async () => {
      if (user) {
          setLoading(true);
          const [products, userOrders, userAddresses] = await Promise.all([
              getProducts(),
              getOrdersForUser(user.uid),
              getAddresses(user.uid)
          ]);
          setAllProducts(products);
          setOrders(userOrders);
          setAddresses(userAddresses.sort((a,b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)));
          setLoading(false);
      }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchUserData();
    }
  }, [user, authLoading, router]);
  
  const wishlistedProducts = allProducts.filter(p => wishlist.includes(p.id));

  const handleAddressSave = () => {
    setIsAddressDialogOpen(false);
    fetchUserData();
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (user && confirm('Are you sure you want to delete this address?')) {
        await deleteAddress(user.uid, addressId);
        toast({ title: 'Address deleted' });
        fetchUserData();
    }
  }
  
  const handleSetDefault = async (addressId: string) => {
    if (user) {
        await setDefaultAddress(user.uid, addressId);
        toast({ title: 'Default address updated' });
        fetchUserData();
    }
  }

  if (loading || authLoading || !user) {
    return <div className="container mx-auto px-4 py-12 md:py-20 text-center">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <Avatar className="w-24 h-24">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'}/>
            <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
            <h1 className="text-4xl font-headline">{user.displayName || 'My Account'}</h1>
            <p className="text-muted-foreground">{user.email}</p>
        </div>
        <Button onClick={signOut} variant="outline" className="md:ml-auto">Logout</Button>
      </div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your name and phone number.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={user.displayName || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" defaultValue={user.phoneNumber || ""} />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="addresses" className="mt-8">
            <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Saved Addresses</CardTitle>
                        <CardDescription>
                          Manage your shipping addresses.
                        </CardDescription>
                      </div>
                      <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2"/>Add New Address</Button>
                      </DialogTrigger>
                  </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {addresses.length > 0 ? addresses.map(address => (
                            <div key={address.id} className="border p-4 rounded-lg flex justify-between items-start">
                                <div>
                                    <p className="font-semibold flex items-center gap-2">
                                        {address.name}
                                        {address.isDefault && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Default</span>}
                                    </p>
                                    <p className="text-muted-foreground">{address.line1}, {address.line2}</p>
                                    <p className="text-muted-foreground">{address.city}, {address.state} - {address.pincode}</p>
                                    <p className="text-muted-foreground">Mobile: {address.mobile}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!address.isDefault && (
                                        <Button variant="ghost" size="sm" onClick={() => handleSetDefault(address.id)}>
                                            <Star className="h-4 w-4 mr-2"/> Set as Default
                                        </Button>
                                    )}
                                    <Button variant="destructive" size="icon" onClick={() => handleDeleteAddress(address.id)}>
                                        <Trash className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-muted-foreground text-center py-8">You have no saved addresses.</p>
                        )}
                    </div>
                </CardContent>
              </Card>
              <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                      <DialogTitle>Add New Address</DialogTitle>
                  </DialogHeader>
                  <AddressForm userId={user.uid} onSave={handleAddressSave} />
              </DialogContent>
          </Dialog>
        </TabsContent>
        <TabsContent value="wishlist" className="mt-8">
            {wishlistLoading ? (
                <p>Loading wishlist...</p>
            ) : wishlistedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {wishlistedProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-muted-foreground text-xl mb-4">Your wishlist is empty.</p>
                    <Button asChild>
                        <Link href="/products">Discover Products</Link>
                    </Button>
                </div>
            )}
        </TabsContent>
        <TabsContent value="orders" className="mt-8">
            <div className="space-y-8">
            {orders.length > 0 ? orders.map(order => (
                <Card key={order.id}>
                    <CardHeader className="flex flex-col md:flex-row justify-between md:items-center">
                        <div>
                            <CardTitle>Order #{order.id.substring(0, 7)}</CardTitle>
                            <CardDescription>Date: {new Date(order.createdAt).toLocaleDateString()}</CardDescription>
                        </div>
                        <div className="text-left md:text-right mt-2 md:mt-0">
                           <p className="font-bold">₹{order.totalAmount.toFixed(2)}</p>
                           <p className="text-sm text-muted-foreground">{order.status}</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Separator className="my-4" />
                        <div className="space-y-4">
                        {order.items.map(item => (
                            <div key={item.id} className="flex items-center gap-4">
                                <Image src={item.images[0]} alt={item.name} width={64} height={64} className="w-16 h-16 rounded-md object-cover" />
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline">View Details</Button>
                    </CardFooter>
                </Card>
            )) : (
                 <div className="text-center py-16">
                    <p className="text-muted-foreground text-xl mb-4">You have not placed any orders yet.</p>
                    <Button asChild>
                        <Link href="/products">Start Shopping</Link>
                    </Button>
                </div>
            )}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
