
import { getAllProducts } from "@/services/productService";
import { getAllCategories } from "@/services/categoryService";
import type { Product, Category } from "@/lib/types";
import { ProductFilters } from "./_components/product-filters";
import { ProductGrid } from "./_components/product-grid";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="grid md:grid-cols-[280px_1fr] gap-8">
      <div className="hidden md:block">
        <Skeleton className="h-[600px] w-full" />
      </div>
      <div>
        <Skeleton className="h-8 w-1/4 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-[300px] w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

async function ProductsPageContent() {
  const productsData = await getAllProducts();
  const categoriesData = await getAllCategories();

  const products = productsData.filter(p => p.isPublished).map(toPlainObject) as Product[];
  const categories = categoriesData.map(toPlainObject) as Category[];

  const maxPrice = products.reduce((max, p) => p.price > max ? p.price : max, 0);

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-8 items-start">
      <div className="hidden md:block sticky top-24">
        <ProductFilters categories={categories} maxPrice={maxPrice} />
      </div>
      <div className="md:col-start-2">
        <div className="md:hidden mb-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filters & Sort
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] p-4">
                <ProductFilters categories={categories} maxPrice={maxPrice} />
            </SheetContent>
          </Sheet>
        </div>
        <ProductGrid initialProducts={products} />
      </div>
    </div>
  );
}

export default async function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline font-bold">Our Collections</h1>
        <p className="text-lg text-muted-foreground mt-2">Explore our exquisite range of handcrafted jewelry.</p>
      </div>

      <Suspense fallback={<ProductPageSkeleton/>}>
        <ProductsPageContent />
      </Suspense>

    </div>
  );
}
