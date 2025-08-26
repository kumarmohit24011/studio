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
import { addProduct, updateProduct } from "@/services/productService";

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
  images: ["https://placehold.co/600x600.png"],
  category: "Rings",
  metal: "Gold",
  sku: "",
  stock: 0,
  gemstone: undefined,
  tags: [],
};

export function ProductDialog({ isOpen, onClose, onSave, product }: ProductDialogProps) {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData(product);
      setIsFeatured(product.tags?.includes('featured') || false);
      setIsTrending(product.tags?.includes('trending') || false);
    } else {
      setFormData(emptyProduct);
      setIsFeatured(false);
      setIsTrending(false);
    }
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
  
  const handleFeaturedChange = (checked: boolean) => {
    setIsFeatured(checked);
  }

  const handleTrendingChange = (checked: boolean) => {
    setIsTrending(checked);
  }

  const handleSubmit = async () => {
    // Start with existing tags, filtering out any managed by switches
    const otherTags = formData.tags?.filter(tag => tag !== 'featured' && tag !== 'trending' && tag !== 'new' && tag !== 'sale') || [];
    
    const newTags = [...otherTags];
    if (isFeatured) newTags.push('featured');
    if (isTrending) newTags.push('trending');

    const dataToSave = {
      ...formData,
      gemstone: formData.gemstone || null,
      tags: newTags,
    };

    if (product) {
      await updateProduct(product.id, dataToSave);
    } else {
      await addProduct(dataToSave);
    }
    onSave();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea id="description" value={formData.description} onChange={handleChange} className="col-span-3" />
          </div>
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
                    <SelectItem value="Rings">Rings</SelectItem>
                    <SelectItem value="Necklaces">Necklaces</SelectItem>
                    <SelectItem value="Bracelets">Bracelets</SelectItem>
                    <SelectItem value="Earrings">Earrings</SelectItem>
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
                onCheckedChange={handleFeaturedChange}
            />
           </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="trending" className="text-right">Trending</Label>
            <Switch
                id="trending"
                checked={isTrending}
                onCheckedChange={handleTrendingChange}
            />
           </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
