
'use client';

import { ProductCard } from './product-card';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';


interface ProductGridProps {
  products: Product[];
  visibleCount: number;
  onLoadMore: () => void;
  totalProducts: number;
}


export function ProductGrid({ products, visibleCount, onLoadMore, totalProducts }: ProductGridProps) {
  
  return (
     <div>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {products.length} of {totalProducts} products
        </p>
      </div>

      {products.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <h3 className="text-xl font-semibold">No Products Found</h3>
            <p className="mt-2">Try adjusting your filters or checking back later.</p>
          </div>
        )}
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {visibleCount < totalProducts && (
        <div className="text-center mt-12">
          <Button onClick={onLoadMore} variant="outline" size="lg">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
