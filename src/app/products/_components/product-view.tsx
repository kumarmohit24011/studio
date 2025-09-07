
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { Product, Category } from '@/lib/types';
import { ProductGrid } from './product-grid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface ProductViewProps {
  initialProducts: Product[];
  categories: Category[];
}

const ITEMS_PER_PAGE = 12;

export function ProductView({ initialProducts, categories }: ProductViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState(initialProducts);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const selectedCategory = searchParams.get('category') || 'all';
  const selectedSort = searchParams.get('sort') || 'newest';

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'all' && name === 'category') {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );
  
  const handleCategoryChange = (category: string) => {
    router.push(pathname + '?' + createQueryString('category', category));
  };
  
  const handleSortChange = (sort: string) => {
    router.push(pathname + '?' + createQueryString('sort', sort));
  };


  useEffect(() => {
    let filtered = [...initialProducts];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // Sort
    switch (selectedSort) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());
        break;
    }

    setProducts(filtered);
    setVisibleCount(ITEMS_PER_PAGE); // Reset pagination
  }, [selectedCategory, selectedSort, initialProducts]);

  const visibleProducts = useMemo(() => {
    return products.slice(0, visibleCount);
  }, [products, visibleCount]);

  const loadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };
  
  return (
    <div>
        <div className="text-center mb-12">
            <h1 className="text-4xl font-headline font-bold">Our Collections</h1>
            <p className="text-lg text-muted-foreground mt-2">Explore our exquisite range of handcrafted jewelry.</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="w-full md:w-auto">
                <TabsList className="grid w-full grid-cols-3 md:w-auto">
                    <TabsTrigger value="all">All Products</TabsTrigger>
                    {categories.map((category) => (
                        <TabsTrigger key={category.id} value={category.name}>
                            {category.name}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
            <div className="w-full md:w-auto md:min-w-[200px]">
                <Select
                    value={selectedSort}
                    onValueChange={handleSortChange}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sort products" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Sort by: Newest</SelectItem>
                        <SelectItem value="price_asc">Sort by: Price: Low to High</SelectItem>
                        <SelectItem value="price_desc">Sort by: Price: High to Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        
        <ProductGrid 
            products={visibleProducts} 
            visibleCount={visibleCount} 
            onLoadMore={loadMore} 
            totalProducts={products.length}
        />
    </div>
  );
}
