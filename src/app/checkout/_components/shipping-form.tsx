

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
import { CheckCircle, Home, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { StoredAddress } from '@/lib/types';

interface ShippingFormProps {
    onFormSubmit: (data: z.infer<typeof shippingSchema>) => void;
}

const newAddressSchema = shippingSchema.extend({
  saveAddress: z.boolean().default(false),
  isDefault: z.boolean().default(false),
});

export function ShippingForm({ onFormSubmit }: ShippingFormProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
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
    if (addresses.length > 0 && !showNewAddressForm) {
      const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddress.id);
      form.reset({ ...defaultAddress, saveAddress: false, isDefault: false });
      onFormSubmit(defaultAddress); // Pre-select the default address
    } else {
      setShowNewAddressForm(true);
      form.reset({
         name: userProfile?.name || '',
         phone: userProfile?.phone || '',
         street: '', city: '', state: '', zipCode: '', country: 'India',
         saveAddress: true, isDefault: false,
      });
    }
  }, [userProfile, form]); // Removed onFormSubmit and showNewAddressForm

  const handleAddressSelection = (addressId: string) => {
    setSelectedAddressId(addressId);
    if (addressId === 'new') {
        setShowNewAddressForm(true);
        form.reset({
            name: userProfile?.name || '',
            phone: userProfile?.phone || '',
            street: '', city: '', state: '', zipCode: '', country: 'India',
            saveAddress: true, isDefault: false,
        });
    } else {
        setShowNewAddressForm(false);
        const selected = userProfile?.addresses?.find(a => a.id === addressId);
        if(selected) {
            form.reset({ ...selected, saveAddress: false, isDefault: false });
            onFormSubmit(selected);
        }
    }
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
            await updateUserProfile(user.uid, { addresses: [...existingAddresses, newAddress] });
             toast({
                title: "Address Saved",
                description: "Your new shipping address has been saved.",
            });
        } catch (error) {
             toast({
                variant: 'destructive',
                title: "Save Failed",
                description: "Could not save your new shipping address.",
            });
        }
    }
    toast({
        title: "Address Confirmed",
        description: "Your shipping address is set for this order.",
        action: <CheckCircle className='text-green-500' />
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
            <FormLabel>Saved Addresses</FormLabel>
            <Select onValueChange={handleAddressSelection} value={selectedAddressId}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a saved address" />
                </SelectTrigger>
                <SelectContent>
                    {userProfile?.addresses?.map(addr => (
                        <SelectItem key={addr.id} value={addr.id}>
                            <div className='flex items-center gap-2'>
                                {addr.isDefault && <Home className='h-4 w-4 text-primary' />}
                                <span>{addr.street}, {addr.city}</span>
                            </div>
                        </SelectItem>
                    ))}
                    <SelectItem value="new">
                         <div className='flex items-center gap-2'>
                            <Plus className='h-4 w-4' />
                            <span>Add a new address</span>
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>

        {showNewAddressForm && (
            <div className='space-y-4 pt-4 border-t'>
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
                        <FormLabel>Save this address</FormLabel>
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

