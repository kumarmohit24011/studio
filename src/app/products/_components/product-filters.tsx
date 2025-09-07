
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import type { Category } from "@/lib/types";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ProductFiltersProps {
  categories: Category[];
  maxPrice: number;
}

export function ProductFilters({ categories, maxPrice }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );
  
  const createMultiQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const existing = params.getAll(name);
      if (existing.includes(value)) {
        const filtered = existing.filter(v => v !== value);
        params.delete(name);
        filtered.forEach(v => params.append(name, v));
      } else {
        params.append(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  const clearFilters = () => {
    router.push(pathname);
  };
  
  const selectedCategories = searchParams.getAll('category');
  const selectedSort = searchParams.get('sort') || 'newest';
  const selectedPrice = parseInt(searchParams.get('price') || `${maxPrice}`);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Filters</CardTitle>
        {searchParams.toString() && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2"/>
                Clear
            </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-semibold">Sort By</Label>
          <Select
            value={selectedSort}
            onValueChange={(value) => router.push(pathname + '?' + createQueryString('sort', value))}
          >
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Sort products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div>
          <Label className="text-base font-semibold">Categories</Label>
          <div className="space-y-3 mt-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${category.id}`}
                  checked={selectedCategories.includes(category.name)}
                  onCheckedChange={() => router.push(pathname + '?' + createMultiQueryString('category', category.name))}
                />
                <Label htmlFor={`cat-${category.id}`} className="font-normal cursor-pointer">{category.name}</Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
           <Label htmlFor="price-range" className="text-base font-semibold">Price Range</Label>
           <div className="mt-2">
             <div className="flex justify-between items-center mb-4">
                <Input value={`₹0`} readOnly className="w-20 h-8 text-center"/>
                <span>-</span>
                <Input value={`₹${selectedPrice.toFixed(0)}`} readOnly className="w-20 h-8 text-center"/>
             </div>
             <Slider
                id="price-range"
                max={maxPrice}
                step={10}
                defaultValue={[selectedPrice]}
                onValueChangeCommitted={(value) => router.push(pathname + '?' + createQueryString('price', `${value[0]}`))}
                className="w-full"
            />
           </div>
        </div>
      </CardContent>
    </Card>
  );
}

