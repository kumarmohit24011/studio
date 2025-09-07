
'use client';

import { useEffect, useState, useCallback } from "react";
import type { Product, Category } from "@/lib/types";
import { ProductGrid } from "./product-grid";
import { ProductFilters } from "./product-filters";
import { useSearchParams } from "next/navigation";

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
    if (filters.category && filters.category.toLowerCase() !== 'all') {
      tempProducts = tempProducts.filter(p => p.category === filters.category);
    }
    
    // Price filter from URL - keep this in case user navigates with it
     const minPrice = Number(searchParams.get('minPrice')) || 0;
     const maxPrice = Number(searchParams.get('maxPrice')) || Infinity;
     if (minPrice > 0 || maxPrice < Infinity) {
        tempProducts = tempProducts.filter(p => p.price >= minPrice && p.price <= maxPrice);
     }


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
        // Ensure createdAt is valid before sorting
        tempProducts.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });
        break;
    }
    
    setFilteredProducts(tempProducts);
  }, [initialProducts, searchParams]);
  
  // This effect runs on initial load AND when URL params change
  useEffect(() => {
    const initialFilters = {
      category: searchParams.get('category') || 'all',
      sortBy: searchParams.get('sort') || 'newest',
    };
    applyFilters(initialFilters);
  }, [searchParams, applyFilters]);

  return (
    <div>
      <ProductFilters categories={categories} onFilterChange={applyFilters} />
      <ProductGrid products={filteredProducts} />
    </div>
  );
}
