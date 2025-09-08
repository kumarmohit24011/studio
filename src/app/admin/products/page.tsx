
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllProducts } from "@/services/productService";
import { getAllCategories } from "@/services/categoryService";
import { ProductActions } from "./_components/product-actions";
import type { Product, Category } from "@/lib/types";

export default async function AdminProductsPage() {
  const productsData = await getAllProducts();
  const categoriesData = await getAllCategories();

  const products: Product[] = productsData.map(p => ({
    ...p,
    createdAt: p.createdAt?.seconds ? new Date(p.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
    updatedAt: p.updatedAt?.seconds ? new Date(p.updatedAt.seconds * 1000).toISOString() : new Date().toISOString(),
  }));

  const categories: Category[] = categoriesData.map(c => ({
    ...c,
    createdAt: c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
  }));

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Manage Products</CardTitle>
          <CardDescription>
            Search, filter, and manage all the products in your store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductActions products={products} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
