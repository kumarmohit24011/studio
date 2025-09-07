
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

interface ProductFiltersProps {
  categories: Category[];
  onFilterChange: (filters: any) => void;
}

export function ProductFilters({ categories, onFilterChange }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  const createQueryString = useCallback((filters: any) => {
    const params = new URLSearchParams(searchParams.toString());
    if (filters.category && filters.category !== 'all') {
      params.set('category', filters.category);
    } else {
      params.delete('category');
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
        category: selectedCategory,
        sortBy
    };
    onFilterChange(currentFilters);
    const queryString = createQueryString(currentFilters);
    router.push(`${pathname}?${queryString}`, { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy]);

  const allCategories = [{ id: 'all', name: 'All' }, ...categories];

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className='flex items-center justify-end'>
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
      
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {allCategories.map((category) => (
            <CarouselItem key={category.id} className="pl-2 basis-auto">
              <Button
                variant={selectedCategory === category.name ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.name)}
                className={cn(
                  "rounded-full whitespace-nowrap",
                  selectedCategory === category.name && "font-bold"
                )}
              >
                {category.name}
              </Button>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
}
