
import { getAllProducts, getProductsByCategory } from "@/services/productService";
import { getAllCategories } from "@/services/categoryService";
import { ProductCard } from "./_components/product-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

type ProductsPageProps = {
  searchParams: {
    category?: string;
  };
};

// Helper to convert Firestore Timestamps
const toPlainObject = (product: any): Product => {
    return {
        ...product,
        createdAt: product.createdAt?.seconds ? new Date(product.createdAt.seconds * 1000).toISOString() : null,
        updatedAt: product.updatedAt?.seconds ? new Date(product.updatedAt.seconds * 1000).toISOString() : null,
    };
};


export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = searchParams;
  let productsData;
  if (category) {
      productsData = await getProductsByCategory(category)
  } else {
      const allProducts = await getAllProducts();
      productsData = allProducts.filter(p => p.isPublished);
  }

  const categories = await getAllCategories();

  const products = productsData.map(toPlainObject);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline font-bold">Our Collections</h1>
        <p className="text-lg text-muted-foreground mt-2">Explore our exquisite range of handcrafted jewelry.</p>
      </div>

      <Tabs defaultValue={category || "all"} className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList>
            <TabsTrigger value="all" asChild>
                <Link href="/products">All</Link>
            </TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.name} asChild>
                <Link href={`/products?category=${cat.name}`}>{cat.name}</Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        <TabsContent value={category || "all"}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </TabsContent>
        {categories.map((cat) => (
             <TabsContent key={cat.id} value={cat.name}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                    {products.filter(p => p.category === cat.name).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </TabsContent>
        ))}

      </Tabs>
       {products.length === 0 && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-headline">No Products Found</h2>
            <p className="text-muted-foreground mt-2">
              There are no products available in this category yet.
            </p>
            <Button asChild className="mt-4">
              <Link href="/products">Browse All Products</Link>
            </Button>
          </div>
        )}
    </div>
  );
}
