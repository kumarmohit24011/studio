
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
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderHistory } from "./_components/order-history";

const profileSchema = z.object({
  name: z.string().min(2, "Display name must be at least 2 characters."),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export default function AccountPage() {
  const { user, userProfile, authLoading, signOutUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: {
      name: userProfile?.name || "",
      phone: userProfile?.phone || "",
      address: userProfile?.address ? `${userProfile.address.street}, ${userProfile.address.city}` : "",
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
          address: userProfile.address ? `${userProfile.address.street}, ${userProfile.address.city}, ${userProfile.address.state} - ${userProfile.address.zipCode}` : ""
        });
    }
  }, [authLoading, user, userProfile, router, form]);
  
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
        setActiveTab(tab);
    }
  }, [searchParams]);

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return;
    try {
      // This is simplified. In a real app, you'd have a proper address form here.
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
    <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
            <Avatar className="h-20 w-20">
                <AvatarImage src={userProfile.photoURL} />
                <AvatarFallback>{userProfile.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-3xl font-bold">{userProfile.name}</h1>
                <p className="text-muted-foreground">{user.email}</p>
            </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="profile">Profile Settings</TabsTrigger>
                <TabsTrigger value="orders">Order History</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
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
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Saved Address</FormLabel>
                                <FormControl>
                                <Textarea placeholder="Your shipping address (managed at checkout)" {...field} disabled />
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
            </TabsContent>
            <TabsContent value="orders">
                <OrderHistory userId={user.uid} />
            </TabsContent>
        </Tabs>
    </div>
  );
}

