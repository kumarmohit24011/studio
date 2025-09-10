
import { getAllProducts } from "@/services/productService";
import { getAllCategories } from "@/services/categoryService";
import type { Product, Category } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductView } from "./_components/product-view";
import { Suspense } from "react";

function ProductPageSkeleton() {
  return (
    <div>
        <div className="flex flex-col gap-4 mb-8">
             <div className="flex items-center justify-end">
                <Skeleton className="h-10 w-48" />
             </div>
             <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-20 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-10 w-28 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-full" />
            </div>
        </div>
         <div className="mb-6">
            <Skeleton className="h-5 w-48" />
        </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const categoryParam = searchParams?.category as string || 'all';
  const sortParam = searchParams?.sort as string || 'newest';

  const categoriesData = await getAllCategories();
  const productsData = await getAllProducts();

  const products: Product[] = productsData.filter((p: Product) => p.isPublished);

  const categories: Category[] = categoriesData;
  const activeCategory = categories.find((c: Category) => c.name === categoryParam);
  const pageTitle = activeCategory ? activeCategory.name : "All Products";
  const pageDescription = activeCategory ? activeCategory.description : "Explore our exquisite range of handcrafted jewelry. Use the filters to find the perfect piece.";


  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">{pageTitle}</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">{pageDescription}</p>
      </div>
      <Suspense fallback={<ProductPageSkeleton/>}>
         <ProductView 
            initialProducts={products} 
            categories={categories}
            initialCategory={categoryParam}
            initialSort={sortParam}
          />
      </Suspense>
    </div>
  );
}
