
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Product } from "@/lib/placeholder-data";
import { useState, useEffect } from "react";
import { addProduct, updateProduct, uploadProductImage } from "@/services/productService";
import { Category, getCategories } from "@/services/categoryService";
import Image from "next/image";
import { X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  product: Product | null;
}

const emptyProduct: Omit<Product, 'id'> = {
  name: "",
  description: "",
  price: 0,
  images: [],
  category: "",
  sku: "",
  stock: 0,
  tags: [],
};

export function ProductDialog({ isOpen, onClose, onSave, product }: ProductDialogProps) {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isSale, setIsSale] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData(product);
      setIsFeatured(product.tags?.includes('featured') || false);
      setIsTrending(product.tags?.includes('trending') || false);
      setIsNew(product.tags?.includes('new') || false);
      setIsSale(product.tags?.includes('sale') || false);
    } else {
      setFormData(emptyProduct);
      setIsFeatured(false);
      setIsTrending(false);
      setIsNew(false);
      setIsSale(false);
    }
    setImageFiles([]); // Reset files on open/close
  }, [product, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (id: string, value: string) => {
     setFormData((prev) => ({ ...prev, [id]: value }));
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: Number(value) }));
  }
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  }

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
    }));
  }

  const handleSubmit = async () => {
    setIsUploading(true);

    const imageUrls = [...formData.images];
    if (imageFiles.length > 0) {
      const uploadPromises = imageFiles.map(file => uploadProductImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      imageUrls.push(...uploadedUrls);
    }

    // Start with existing tags, filtering out any managed by switches
    const otherTags = formData.tags?.filter(tag => !['featured', 'trending', 'new', 'sale'].includes(tag)) || [];
    
    const newTags = [...otherTags];
    if (isFeatured) newTags.push('featured');
    if (isTrending) newTags.push('trending');
    if (isNew) newTags.push('new');
    if (isSale) newTags.push('sale');

    const dataToSave = {
      ...formData,
      images: imageUrls,
      tags: newTags,
    };

    if (product) {
      await updateProduct(product.id, dataToSave);
    } else {
      await addProduct(dataToSave);
    }

    setIsUploading(false);
    onSave();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
           <DialogDescription>
            {product ? "Update the details of this product." : "Fill out the form to add a new product."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 max-h-[80vh] overflow-y-auto pr-4">
          
          {/* Product Details */}
          <div className="grid gap-4">
            <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" value={formData.name} onChange={handleChange} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={handleChange} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                 <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          
          <Separator />

          {/* Pricing and Inventory */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" type="number" value={formData.price} onChange={handleNumberChange} />
             </div>
             <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" value={formData.stock} onChange={handleNumberChange} />
             </div>
             <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" value={formData.sku} onChange={handleChange} />
             </div>
          </div>

          <Separator />
          
          {/* Images */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="images">Product Images</Label>
              <Input id="images" type="file" multiple onChange={handleImageChange} />
              <p className="text-sm text-muted-foreground mt-1">Upload one or more images for your product.</p>
            </div>
            {formData.images.length > 0 && (
               <div className="space-y-2">
                  <Label>Current Images</Label>
                  <div className="grid grid-cols-4 gap-2">
                      {formData.images.map((url, index) => (
                          <div key={index} className="relative">
                              <Image src={url} alt="product image" width={100} height={100} className="rounded-md object-cover aspect-square"/>
                              <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                  onClick={() => handleRemoveImage(index)}
                              >
                                  <X className="h-4 w-4" />
                              </Button>
                          </div>
                      ))}
                  </div>
              </div>
            )}
          </div>
          
          <Separator />

          {/* Tags */}
          <div className="space-y-4">
            <div>
                <h4 className="font-medium">Product Tags</h4>
                <p className="text-sm text-muted-foreground">Select tags to highlight this product across your store.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="featured" checked={isFeatured} onCheckedChange={setIsFeatured}/>
                <Label htmlFor="featured">Featured Product</Label>
              </div>
              <div className="flex items-center space-x-2">
                  <Switch id="trending" checked={isTrending} onCheckedChange={setIsTrending}/>
                  <Label htmlFor="trending">Trending Now</Label>
              </div>
              <div className="flex items-center space-x-2">
                  <Switch id="new" checked={isNew} onCheckedChange={setIsNew}/>
                  <Label htmlFor="new">New Arrival</Label>
              </div>
              <div className="flex items-center space-x-2">
                  <Switch id="sale" checked={isSale} onCheckedChange={setIsSale}/>
                  <Label htmlFor="sale">On Sale</Label>
              </div>
            </div>
          </div>

        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={isUploading}>
            {isUploading ? 'Saving...' : 'Save Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
