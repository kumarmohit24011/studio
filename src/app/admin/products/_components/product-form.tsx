
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
import { X, UploadCloud } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  stock: z.coerce.number().int().min(0, 'Stock must be a non-negative integer.'),
  category: z.string().min(1, 'Please select a category.'),
  tags: z.array(z.string()).optional(),
  images: z.array(z.any()).optional(), // For new file uploads
});

interface ProductFormProps {
  product?: Product;
  categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [previews, setPreviews] = useState<string[]>(product?.imageUrls || []);
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
      images: [],
    },
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        const currentFiles = form.getValues('images') || [];
        form.setValue('images', [...currentFiles, ...files]);
        
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    }
  };
  
  const handleRemovePreview = (index: number) => {
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
    
    // We also need to handle removing the file from the form state if it's a new file
    // And potentially marking existing files for deletion on the server
    const existingImagesCount = product?.imageUrls?.length || 0;
    if (index >= existingImagesCount) {
        const newImages = [...(form.getValues('images') || [])];
        newImages.splice(index - existingImagesCount, 1);
        form.setValue('images', newImages);
    } else {
        // If it's an existing image, we need to update what we pass to the server
        // This is handled in onSubmit by using the `previews` state.
    }
    toast({ title: "Image marked for removal", description: "Save the product to confirm changes."});
  }

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
        // Filter out blob URLs from previews to get existing images
        const existingImageUrls = previews.filter(p => p.startsWith('http'));
        await updateProduct(product.id, { ...values, existingImageUrls }, values.images);
        toast({ title: 'Success', description: 'Product updated successfully.' });
      } else {
        if (!values.images || values.images.length === 0) {
            form.setError('images', { type: 'manual', message: 'At least one product image is required.' });
            return;
        }
        await addProduct(values, values.images);
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
          <div className="space-y-4">
            <FormField
                control={form.control}
                name="images"
                render={() => (
                    <FormItem>
                        <FormLabel>Product Images</FormLabel>
                         <FormControl>
                            <div className="relative w-full border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
                                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">Drag & drop files here, or click to browse</p>
                                <Input 
                                    type="file" 
                                    accept="image/*" 
                                    multiple 
                                    onChange={onFileChange} 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
             />
             {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    {previews.map((src, index) => (
                        <div key={index} className="relative group aspect-square rounded-md overflow-hidden border">
                            <Image src={src} alt={`Preview ${index + 1}`} fill className="object-cover"/>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleRemovePreview(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
             )}
          </div>
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : (product ? "Update Product" : "Add Product")}
        </Button>
      </form>
    </Form>
  );
}
