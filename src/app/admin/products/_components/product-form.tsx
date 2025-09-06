
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import type { Product, Category } from '@/lib/types';
import { addProduct, updateProduct } from '@/services/productService';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  stock: z.coerce.number().int().min(0, 'Stock must be a non-negative integer.'),
  category: z.string().min(1, 'Please select a category.'),
  tags: z.array(z.string()).optional(),
  image: z.any().optional(),
});

interface ProductFormProps {
  product?: Product;
  categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(product?.imageUrl || null);
  const [tagInput, setTagInput] = useState('');

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      stock: product?.stock || 0,
      category: product?.category || '',
      tags: product?.tags || [],
    },
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      form.setValue('image', file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!form.getValues('tags')?.includes(newTag)) {
        form.setValue('tags', [...(form.getValues('tags') || []), newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue('tags', form.getValues('tags')?.filter(tag => tag !== tagToRemove));
  };


  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    try {
      if (product) {
        await updateProduct(product.id, values, values.image);
        toast({ title: 'Success', description: 'Product updated successfully.' });
      } else {
        if (!values.image) {
            form.setError('image', { type: 'manual', message: 'Product image is required.' });
            return;
        }
        await addProduct(values, values.image);
        toast({ title: 'Success', description: 'Product added successfully.' });
      }
      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while saving the product.',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Elegant Diamond Ring" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A detailed description of the product..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price (₹)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g. 1200" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Stock</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g. 10" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
             </div>
             <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category for the product" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                           <div>
                             <Input 
                                placeholder="Add tags (press Enter or comma)" 
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                             />
                              <div className="flex flex-wrap gap-2 mt-2">
                                {field.value?.map(tag => (
                                    <Badge key={tag} variant="secondary">
                                        {tag}
                                        <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                           </div>
                        </FormControl>
                        <FormDescription>Tags help with searching and filtering (e.g. `new`, `popular`, `sale`).</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
          </div>
          <div className="space-y-2">
            <FormField
                control={form.control}
                name="image"
                render={() => (
                    <FormItem>
                        <FormLabel>Product Image</FormLabel>
                        {preview && (
                            <div className="relative w-full aspect-square rounded-md overflow-hidden border">
                                <Image src={preview} alt="Product image preview" fill className="object-cover" />
                            </div>
                        )}
                        <FormControl>
                            <Input type="file" accept="image/*" onChange={onFileChange} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
             />
          </div>
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : (product ? "Update Product" : "Add Product")}
        </Button>
      </form>
    </Form>
  );
}
