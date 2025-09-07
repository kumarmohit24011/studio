
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category } from '@/lib/types';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Filter } from 'lucide-react';

interface ProductFiltersProps {
  categories: Category[];
  onFilterChange: (filters: any) => void;
}

export function ProductFilters({ categories, onFilterChange }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL search params
  const [selectedCategories, setSelectedCategories] = useState<string[]>(searchParams.get('categories')?.split(',').filter(Boolean) || []);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get('minPrice')) || 0,
    Number(searchParams.get('maxPrice')) || 50000
  ]);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [isSheetOpen, setSheetOpen] = useState(false);

  // Function to create a query string from the current state
  const createQueryString = useCallback((filters: any) => {
    const params = new URLSearchParams();
    if (filters.categories.length > 0) {
      params.set('categories', filters.categories.join(','));
    }
    if (filters.priceRange[0] > 0) {
      params.set('minPrice', filters.priceRange[0].toString());
    }
    if (filters.priceRange[1] < 50000) {
      params.set('maxPrice', filters.priceRange[1].toString());
    }
    if (filters.sortBy !== 'newest') {
      params.set('sort', filters.sortBy);
    }
    return params.toString();
  }, []);
  
  // This effect synchronizes the component's state with the URL's search parameters.
  // It runs whenever the search params change (e.g., when the user clicks a browser back/forward button).
  useEffect(() => {
    setSelectedCategories(searchParams.get('categories')?.split(',').filter(Boolean) || []);
    setPriceRange([
        Number(searchParams.get('minPrice')) || 0,
        Number(searchParams.get('maxPrice')) || 50000,
    ]);
    setSortBy(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  // Handler for applying filters. It calls the parent's onFilterChange
  // and updates the URL.
  const handleApplyFilters = () => {
    const filters = {
      categories: selectedCategories,
      priceRange,
      sortBy,
    };
    onFilterChange(filters);
    const queryString = createQueryString(filters);
    // Using { scroll: false } prevents the page from scrolling to the top on navigation.
    router.push(`${pathname}?${queryString}`, { scroll: false });
    setSheetOpen(false); // Close mobile sheet on apply
  };

  const handleCategoryChange = (categoryId: string, checked: boolean | 'indeterminate') => {
    setSelectedCategories(prev =>
      checked ? [...prev, categoryId] : prev.filter(id => id !== categoryId)
    );
  };
  
  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Sort By</h3>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort products" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <h3 className="font-semibold mb-3">Category</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${category.id}`}
                checked={selectedCategories.includes(category.name)}
                onCheckedChange={(checked) => handleCategoryChange(category.name, checked)}
              />
              <Label htmlFor={`cat-${category.id}`} className="font-normal">{category.name}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <Slider
          defaultValue={[0, 50000]}
          max={50000}
          step={100}
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div>
      </div>
      <Button onClick={handleApplyFilters} className="w-full">Apply Filters</Button>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Sheet */}
      <div className="md:hidden mb-6">
        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
             <Button variant="outline" className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              Filter & Sort
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
             <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filter Sidebar */}
      <aside className="hidden md:block w-64 lg:w-72 sticky top-24 pr-8">
        <h2 className="text-xl font-bold mb-4">Filters</h2>
        <FilterContent />
      </aside>
    </>
  );
}
