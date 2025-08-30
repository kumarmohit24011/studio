
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  metal: "Gold",
  sku: "",
  stock: 0,
  gemstone: undefined,
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
      gemstone: formData.gemstone || null,
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
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[80vh] overflow-y-auto pr-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea id="description" value={formData.description} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="images" className="text-right">Images</Label>
            <Input id="images" type="file" multiple onChange={handleImageChange} className="col-span-3" />
          </div>
          {formData.images.length > 0 && (
             <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Current</Label>
                <div className="col-span-3 grid grid-cols-4 gap-2">
                    {formData.images.map((url, index) => (
                        <div key={index} className="relative">
                            <Image src={url} alt="product image" width={100} height={100} className="rounded-md object-cover"/>
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">Price</Label>
            <Input id="price" type="number" value={formData.price} onChange={handleNumberChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock" className="text-right">Stock</Label>
            <Input id="stock" type="number" value={formData.stock} onChange={handleNumberChange} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sku" className="text-right">SKU</Label>
            <Input id="sku" value={formData.sku} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="metal" className="text-right">Metal</Label>
             <Select value={formData.metal} onValueChange={(value) => handleSelectChange('metal', value)}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a metal" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Platinum">Platinum</SelectItem>
                </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gemstone" className="text-right">Gemstone</Label>
             <Select value={formData.gemstone} onValueChange={(value) => handleSelectChange('gemstone', value)}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a gemstone" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Diamond">Diamond</SelectItem>
                    <SelectItem value="Ruby">Ruby</SelectItem>
                    <SelectItem value="Sapphire">Sapphire</SelectItem>
                    <SelectItem value="Emerald">Emerald</SelectItem>
                </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="featured" className="text-right">Featured</Label>
            <Switch
                id="featured"
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
            />
           </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="trending" className="text-right">Trending</Label>
            <Switch
                id="trending"
                checked={isTrending}
                onCheckedChange={setIsTrending}
            />
           </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new" className="text-right">New Arrival</Label>
            <Switch
                id="new"
                checked={isNew}
                onCheckedChange={setIsNew}
            />
           </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sale" className="text-right">On Sale</Label>
            <Switch
                id="sale"
                checked={isSale}
                onCheckedChange={setIsSale}
            />
           </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={isUploading}>
            {isUploading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
