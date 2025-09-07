
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

  const applyFilters = useCallback((filters: { category: string; sortBy: string; }) => {
    let tempProducts = [...initialProducts];

    // Category filter
    if (filters.category && filters.category.toLowerCase() !== 'all') {
      tempProducts = tempProducts.filter(p => p.category === filters.category);
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
        tempProducts.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });
        break;
    }
    
    setFilteredProducts(tempProducts);
  }, [initialProducts]);
  
  useEffect(() => {
    const initialFilters = {
      category: searchParams.get('category') || 'all',
      sortBy: searchParams.get('sort') || 'newest',
    };
    applyFilters(initialFilters);
  }, [searchParams, initialProducts, applyFilters]);

  return (
    <div>
      <ProductFilters categories={categories} onFilterChange={applyFilters} />
      <ProductGrid products={filteredProducts} />
    </div>
  );
}
