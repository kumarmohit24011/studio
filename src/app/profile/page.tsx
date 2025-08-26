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
import { products } from "@/lib/placeholder-data";
import { ProductCard } from "@/components/ProductCard";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const orders = [
    // Mock data, will be connected to db later
    {
      id: "ORD001",
      date: "June 23, 2024",
      status: "Delivered",
      total: 125000.0,
      items: [products[0], products[1]],
    },
    {
      id: "ORD002",
      date: "May 15, 2024",
      status: "Processing",
      total: 89900.0,
      items: [products[2]],
    },
  ];

  if (loading || !user) {
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
          <Card>
            <CardHeader>
              <CardTitle>Saved Addresses</CardTitle>
              <CardDescription>
                Manage your shipping addresses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button>Add New Address</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="wishlist" className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.slice(0, 4).map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </TabsContent>
        <TabsContent value="orders" className="mt-8">
            <div className="space-y-8">
            {orders.map(order => (
                <Card key={order.id}>
                    <CardHeader className="flex flex-row justify-between items-center">
                        <div>
                            <CardTitle>Order {order.id}</CardTitle>
                            <CardDescription>Date: {order.date}</CardDescription>
                        </div>
                        <div className="text-right">
                           <p className="font-bold">₹{order.total.toFixed(2)}</p>
                           <p className="text-sm text-muted-foreground">{order.status}</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Separator className="my-4" />
                        <div className="space-y-4">
                        {order.items.map(item => (
                            <div key={item.id} className="flex items-center gap-4">
                                <img src={item.images[0]} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                                <div>
                                    <p className="font-semibold">{item.name}</p>
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
            ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
