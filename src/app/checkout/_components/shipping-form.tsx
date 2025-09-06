

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@zod/resolvers/zod';
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
import { CheckCircle, Home, Plus, MapPin } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import type { StoredAddress } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface ShippingFormProps {
    onFormSubmit: (data: z.infer<typeof shippingSchema> | null) => void;
}

const newAddressSchema = shippingSchema.extend({
  saveAddress: z.boolean().default(false),
  isDefault: z.boolean().default(false),
});

export function ShippingForm({ onFormSubmit }: ShippingFormProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const form = useForm<z.infer<typeof newAddressSchema>>({
    resolver: zodResolver(newAddressSchema),
    defaultValues: {
      name:  '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      phone: '',
      saveAddress: true,
      isDefault: false,
    },
  });

  useEffect(() => {
    const addresses = userProfile?.addresses || [];
    if (addresses.length > 0) {
      const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
      handleAddressSelection(defaultAddress.id);
    } else {
      setShowNewAddressForm(true);
      setSelectedAddressId(null);
      onFormSubmit(null);
      form.reset({
         name: userProfile?.name || '',
         phone: userProfile?.phone || '',
         street: '', city: '', state: '', zipCode: '', country: 'India',
         saveAddress: true, isDefault: false,
      });
    }
  }, [userProfile]); 

  const handleAddressSelection = (addressId: string) => {
    setShowNewAddressForm(false);
    setSelectedAddressId(addressId);
    const selected = userProfile?.addresses?.find(a => a.id === addressId);
    if(selected) {
        form.reset({ ...selected, saveAddress: false, isDefault: false });
        onFormSubmit(selected);
    }
  }

  const handleAddNewClick = () => {
    setShowNewAddressForm(true);
    setSelectedAddressId(null);
    onFormSubmit(null);
    form.reset({
        name: userProfile?.name || '',
        phone: userProfile?.phone || '',
        street: '', city: '', state: '', zipCode: '', country: 'India',
        saveAddress: true, isDefault: false,
    });
  }

  const onSubmit = async (data: z.infer<typeof newAddressSchema>) => {
    onFormSubmit(data);
    
    if (user && data.saveAddress) {
        try {
            const newAddress: StoredAddress = {
                id: `addr_${Date.now()}`, // simple unique id
                name: data.name,
                street: data.street,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                country: data.country,
                phone: data.phone,
                isDefault: data.isDefault,
            };
            const existingAddresses = userProfile?.addresses || [];
            
            let finalAddresses = [...existingAddresses];
            if (newAddress.isDefault) {
                finalAddresses = finalAddresses.map(addr => ({ ...addr, isDefault: false }));
            }
            finalAddresses.push(newAddress);

            await updateUserProfile(user.uid, { addresses: finalAddresses });
             toast({
                title: "Address Saved",
                description: "Your new shipping address has been saved.",
            });
            setShowNewAddressForm(false);
            setSelectedAddressId(newAddress.id);
        } catch (error) {
             toast({
                variant: 'destructive',
                title: "Save Failed",
                description: "Could not save your new shipping address.",
            });
        }
    } else {
         toast({
            title: "Address Confirmed",
            description: "Your shipping address is set for this order.",
            action: <CheckCircle className='text-green-500' />
        });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-3">
            <FormLabel>Saved Addresses</FormLabel>
            {userProfile?.addresses && userProfile.addresses.length > 0 && (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {userProfile.addresses.map(addr => (
                         <Card 
                            key={addr.id} 
                            onClick={() => handleAddressSelection(addr.id)}
                            className={cn(
                                "p-4 rounded-lg cursor-pointer border-2 transition-colors relative",
                                selectedAddressId === addr.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                            )}
                         >
                            {addr.isDefault && <Badge className="absolute -top-2 -right-2">Default</Badge>}
                            <p className="font-semibold">{addr.name}</p>
                            <p className="text-muted-foreground text-sm mt-1">{addr.street}, {addr.city}</p>
                            <p className="text-muted-foreground text-sm">{addr.state}, {addr.zipCode}</p>
                            <p className="text-muted-foreground text-sm mt-2">{addr.phone}</p>
                         </Card>
                    ))}
                </div>
            )}
             <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleAddNewClick}
                >
                <Plus className="mr-2 h-4 w-4" />
                Add a new address
            </Button>
        </div>

        {showNewAddressForm && (
            <div className='space-y-4 pt-4 border-t'>
                 <h3 className="text-lg font-semibold">New Address Details</h3>
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
                 <FormField
                  control={form.control}
                  name="saveAddress"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Save this address for future use</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                 {form.getValues('saveAddress') && (
                     <FormField
                        control={form.control}
                        name="isDefault"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Set as default address</FormLabel>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            </FormItem>
                        )}
                        />
                 )}
                 <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                     {form.formState.isSubmitting ? "Saving..." : "Use this address"}
                </Button>
            </div>
        )}
      </form>
    </Form>
  );
}
