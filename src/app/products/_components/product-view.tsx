
'use client';

import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import type { Product, Category } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductGrid } from "./product-grid";
import { ProductFilters } from "./product-filters";
import { useSearchParams } from "next/navigation";

function ProductPageSkeleton() {
  return (
    <div className="flex gap-8">
      <div className="hidden md:block w-64 lg:w-72">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
      <div className="flex-1">
        <Skeleton className="h-6 w-1/4 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ProductViewProps {
  initialProducts: Product[];
  categories: Category[];
}

export function ProductView({ initialProducts, categories }: ProductViewProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const searchParams = useSearchParams();

  const applyFilters = useCallback((filters: any) => {
    let tempProducts = [...initialProducts];

    // Category filter
    if (filters.categories.length > 0) {
      tempProducts = tempProducts.filter(p => filters.categories.includes(p.category));
    }

    // Price filter
    tempProducts = tempProducts.filter(
      p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Sort
    switch (filters.sortBy) {
      case 'price_asc':
        tempProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        tempProducts.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        tempProducts.sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());
        break;
    }
    
    setFilteredProducts(tempProducts);
  }, [initialProducts]);
  
  // This effect runs on initial load AND when URL params change
  useEffect(() => {
    const initialFilters = {
      categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
      priceRange: [
        Number(searchParams.get('minPrice')) || 0,
        Number(searchParams.get('maxPrice')) || 50000
      ],
      sortBy: searchParams.get('sort') || 'newest',
    };
    applyFilters(initialFilters);
  }, [searchParams, applyFilters]);

  return (
    <div className="flex flex-col md:flex-row items-start gap-8">
      <ProductFilters categories={categories} onFilterChange={applyFilters} />
      <ProductGrid products={filteredProducts} />
    </div>
  );
}
