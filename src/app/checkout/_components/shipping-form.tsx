
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { shippingSchema } from '@/lib/schemas';
import { updateUserProfile } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

interface ShippingFormProps {
    onFormSubmit: (data: z.infer<typeof shippingSchema>) => void;
}

export function ShippingForm({ onFormSubmit }: ShippingFormProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);

  const form = useForm<z.infer<typeof shippingSchema>>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name:  '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      phone: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        street: userProfile.address?.street || '',
        city: userProfile.address?.city || '',
        state: userProfile.address?.state || '',
        zipCode: userProfile.address?.zipCode || '',
        country: userProfile.address?.country || 'India',
      });
    }
  }, [userProfile, form]);
  
  useEffect(() => {
    const subscription = form.watch(() => setIsSaved(false));
    return () => subscription.unsubscribe();
  }, [form]);


  const onSubmit = async (data: z.infer<typeof shippingSchema>) => {
    onFormSubmit(data);
    setIsSaved(true);
    // Optionally save the address to user's profile for future use
    if (user) {
        try {
            const address = {
                street: data.street,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                country: data.country,
            }
            await updateUserProfile(user.uid, { address, phone: data.phone });
             toast({
                title: "Address Saved",
                description: "Your shipping address has been saved for future orders.",
            });
        } catch (error) {
             toast({
                variant: 'destructive',
                title: "Save Failed",
                description: "Could not save your address.",
            });
        }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
                <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                    <Input placeholder="Mumbai" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
                <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                    <Input placeholder="Maharashtra" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Zip Code</FormLabel>
                    <FormControl>
                        <Input placeholder="400001" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                        <Input disabled {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                    <Input placeholder="For shipping updates" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || isSaved}>
            {isSaved ? <><CheckCircle className="mr-2 h-4 w-4" /> Address Saved</> : "Save Shipping Address"}
        </Button>
      </form>
    </Form>
  );
}
