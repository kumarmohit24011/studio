
import { getAllProducts } from "@/services/productService";
import { getAllCategories } from "@/services/categoryService";
import type { Product, Category } from "@/lib/types";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductView } from "./_components/product-view";

// Helper to convert Firestore Timestamps
const toPlainObject = (data: any) => {
  const plain = { ...data };
  for (const key in plain) {
    if (plain[key]?.seconds) {
      plain[key] = new Date(plain[key].seconds * 1000).toISOString();
    }
  }
  return plain;
};

function ProductPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
            <Skeleton className="h-10 w-1/2 mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
        </div>
        <Skeleton className="h-10 w-full mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-[300px] w-full" />
          ))}
        </div>
      </div>
  )
}

async function ProductsPageContent() {
  const productsData = await getAllProducts();
  const categoriesData = await getAllCategories();

  const products = productsData.filter(p => p.isPublished).map(toPlainObject) as Product[];
  const categories = categoriesData.map(toPlainObject) as Category[];

  return (
    <ProductView initialProducts={products} categories={categories} />
  );
}

export default async function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<ProductPageSkeleton/>}>
        <ProductsPageContent />
      </Suspense>
    </div>
  );
}
