
'use client';

import { ProductCard } from './product-card';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { useState, useMemo } from 'react';

interface ProductGridProps {
  products: Product[];
}

const ITEMS_PER_PAGE = 12;

export function ProductGrid({ products }: ProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const visibleProducts = useMemo(() => {
    return products.slice(0, visibleCount);
  }, [products, visibleCount]);

  const loadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  return (
    <div className="flex-1">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {visibleProducts.length} of {products.length} products
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <h3 className="text-xl font-semibold">No Products Found</h3>
          <p className="mt-2">Try adjusting your filters or checking back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
          {visibleProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

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
