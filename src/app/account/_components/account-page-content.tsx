
'use client';

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { updateUserProfile } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OrderHistory } from "./order-history";
import { Home } from "lucide-react";
import { WishlistTab } from "./wishlist-tab";
import type { StoredAddress } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const profileSchema = z.object({
  name: z.string().min(2, "Display name must be at least 2 characters."),
  phone: z.string().optional(),
});

export function AccountPageContent() {
  const { user, userProfile, authLoading, signOutUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: {
      name: userProfile?.name || "",
      phone: userProfile?.phone || "",
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (userProfile) {
        form.reset({
          name: userProfile.name,
          phone: userProfile.phone || "",
        });
    }
  }, [authLoading, user, userProfile, router, form]);

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return;
    try {
      await updateUserProfile(user.uid, { name: values.name, phone: values.phone });
      toast({
        title: "Success",
        description: "Your profile has been updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile.",
      });
    }
  };
  
  if (authLoading || !user || !userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
        <header>
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={userProfile.photoURL} />
                    <AvatarFallback>{userProfile.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-3xl font-bold">{userProfile.name}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
            </div>
        </header>

        <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="orders">Order History</TabsTrigger>
                <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6">
                 <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Profile</CardTitle>
                                <CardDescription>Manage your profile information.</CardDescription>
                            </CardHeader>
                            <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={user.email || ''} disabled />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Name</FormLabel>
                                        <FormControl>
                                        <Input placeholder="Your name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                        <Input placeholder="Your phone number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <div className="flex justify-between">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                                    </Button>
                                    <Button variant="outline" onClick={signOutUser}>Sign Out</Button>
                                </div>
                                </form>
                            </Form>
                            </CardContent>
                        </Card>
                    </div>
                    <div>
                        <Card>
                                <CardHeader>
                                <CardTitle>Saved Addresses</CardTitle>
                                <CardDescription>Your saved shipping addresses.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {userProfile.addresses && userProfile.addresses.length > 0 ? (
                                    userProfile.addresses.map((addr: StoredAddress) => (
                                        <div key={addr.id} className="text-sm p-3 rounded-md border bg-muted/30 relative">
                                            {addr.isDefault && <Badge className="absolute -top-2 -right-2">Default</Badge>}
                                            <p className="font-semibold">{addr.name}</p>
                                            <p className="text-muted-foreground">{addr.street}, {addr.city}</p>
                                            <p className="text-muted-foreground">{addr.state}, {addr.zipCode}</p>
                                            <p className="text-muted-foreground">{addr.country}</p>
                                            <p className="text-muted-foreground mt-2">{addr.phone}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground text-sm">
                                        <Home className="mx-auto h-8 w-8 mb-2" />
                                        <p>No saved addresses.</p>
                                        <p>Your addresses will appear here after you save them during checkout.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="orders" className="mt-6">
                <OrderHistory userId={user.uid} />
            </TabsContent>
            <TabsContent value="wishlist" className="mt-6">
                <WishlistTab />
            </TabsContent>
        </Tabs>
    </div>
  );
}
