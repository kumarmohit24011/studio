
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Product } from '@/lib/types';
import { ProductCard } from './product-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductGridProps {
  initialProducts: Product[];
}

const ITEMS_PER_PAGE = 12;

export function ProductGrid({ initialProducts }: ProductGridProps) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialProducts);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    // Reset products and count when search params change
    const sort = searchParams.get('sort') || 'newest';
    const categories = searchParams.getAll('category');
    const maxPrice = searchParams.get('price');

    let filtered = [...initialProducts];

    // Filter by category
    if (categories.length > 0) {
      filtered = filtered.filter(p => categories.includes(p.category));
    }

    // Filter by price
    if (maxPrice) {
      const price = parseInt(maxPrice);
      filtered = filtered.filter(p => p.price <= price);
    }
    
    // Sort
    switch (sort) {
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
  }, [searchParams, initialProducts]);

  const visibleProducts = useMemo(() => {
    return products.slice(0, visibleCount);
  }, [products, visibleCount]);

  const loadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };
  
  return (
     <div>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {visibleProducts.length} of {products.length} products
        </p>
      </div>

      {products.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <h3 className="text-xl font-semibold">No Products Found</h3>
            <p className="mt-2">Try adjusting your filters or checking back later.</p>
          </div>
        )}
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {visibleProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {visibleCount < products.length && (
        <div className="text-center mt-12">
          <Button onClick={loadMore} variant="outline" size="lg">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
