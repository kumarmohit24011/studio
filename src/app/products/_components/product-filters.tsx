
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category } from '@/lib/types';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Filter, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ProductFiltersProps {
  categories: Category[];
  onFilterChange: (filters: any) => void;
}

export function ProductFilters({ categories, onFilterChange }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(searchParams.get('categories')?.split(',').filter(Boolean) || []);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get('minPrice')) || 0,
    Number(searchParams.get('maxPrice')) || 50000
  ]);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [tempPriceRange, setTempPriceRange] = useState(priceRange);

  const createQueryString = useCallback((filters: any) => {
    const params = new URLSearchParams(searchParams.toString());
    if (filters.categories.length > 0) {
      params.set('categories', filters.categories.join(','));
    } else {
        params.delete('categories');
    }

    if (filters.priceRange[0] > 0) {
      params.set('minPrice', filters.priceRange[0].toString());
    } else {
        params.delete('minPrice');
    }
    
    if (filters.priceRange[1] < 50000) {
      params.set('maxPrice', filters.priceRange[1].toString());
    } else {
        params.delete('maxPrice');
    }

    if (filters.sortBy && filters.sortBy !== 'newest') {
      params.set('sort', filters.sortBy);
    } else {
        params.delete('sort');
    }
    return params.toString();
  }, [searchParams]);
  
  useEffect(() => {
    const currentFilters = {
        categories: selectedCategories,
        priceRange,
        sortBy
    };
    onFilterChange(currentFilters);
    const queryString = createQueryString(currentFilters);
    router.push(`${pathname}?${queryString}`, { scroll: false });
  // This dependency array intentionally excludes onFilterChange and router to avoid re-running on every render.
  // We only want this to run when the filter values themselves change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, priceRange, sortBy]);
  
  useEffect(() => {
    setTempPriceRange(priceRange);
  }, [priceRange]);

  const handleCategoryChange = (categoryId: string, checked: boolean | 'indeterminate') => {
    setSelectedCategories(prev =>
      checked ? [...prev, categoryId] : prev.filter(id => id !== categoryId)
    );
  };
  
  const handleSheetApply = () => {
    setPriceRange(tempPriceRange);
    setSheetOpen(false);
  }

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 50000]);
    setTempPriceRange([0, 50000]);
  }

  const FilterSheetContent = () => (
    <>
    <SheetHeader className="px-6 pt-6 pb-4">
        <SheetTitle>Filter Products</SheetTitle>
    </SheetHeader>
    <Separator />
    <div className="p-6 space-y-8 overflow-y-auto">
      <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Category</h3>
             {selectedCategories.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedCategories([])}>Clear</Button>
            )}
        </div>
        <div className="space-y-3">
          {categories.map(category => (
            <div key={category.id} className="flex items-center space-x-3">
              <Checkbox
                id={`sheet-cat-${category.id}`}
                checked={selectedCategories.includes(category.name)}
                onCheckedChange={(checked) => handleCategoryChange(category.name, checked)}
                className="h-5 w-5"
              />
              <Label htmlFor={`sheet-cat-${category.id}`} className="font-normal text-base">{category.name}</Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Price Range</h3>
            {(tempPriceRange[0] > 0 || tempPriceRange[1] < 50000) && (
                <Button variant="ghost" size="sm" onClick={() => setTempPriceRange([0, 50000])}>Reset</Button>
            )}
        </div>
        <Slider
          defaultValue={[0, 50000]}
          max={50000}
          step={500}
          value={tempPriceRange}
          onValueChange={(value) => setTempPriceRange(value as [number, number])}
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-3">
          <span>₹{tempPriceRange[0]}</span>
          <span>₹{tempPriceRange[1]}</span>
        </div>
      </div>
    </div>
    <SheetFooter className='p-6 bg-background border-t absolute bottom-0 w-full'>
        <Button onClick={handleSheetApply} className="w-full" size="lg">Apply Filters</Button>
    </SheetFooter>
    </>
  );

  return (
    <div className="flex items-center justify-between gap-4 mb-8">
        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
             <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
             <FilterSheetContent />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
            <Label htmlFor='sort-by' className="text-muted-foreground whitespace-nowrap">Sort by</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger id='sort-by' className='w-[180px]'>
                <SelectValue placeholder="Sort products" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
            </Select>
        </div>
    </div>
  );
}
