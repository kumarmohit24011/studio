
import { getAllProducts } from "@/services/productService";
import { getAllCategories } from "@/services/categoryService";
import type { Product, Category } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductView } from "./_components/product-view";
import { Suspense } from "react";

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

// Helper to convert Firestore Timestamps to a serializable format
const toPlainObject = (item: any, type: 'product' | 'category'): any => {
    return {
        ...item,
        createdAt: item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
    };
};

export default async function ProductsPage() {
  const productsData = await getAllProducts();
  const categoriesData = await getAllCategories();

  const products: Product[] = productsData
    .filter(p => p.isPublished)
    .map(p => toPlainObject(p, 'product'));

  const categories: Category[] = categoriesData.map(c => toPlainObject(c, 'category'));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline font-bold">Our Collections</h1>
        <p className="text-lg text-muted-foreground mt-2">Explore our exquisite range of handcrafted jewelry.</p>
      </div>
      <Suspense fallback={<ProductPageSkeleton/>}>
         <ProductView initialProducts={products} categories={categories} />
      </Suspense>
    </div>
  );
}
