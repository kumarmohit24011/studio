
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllProducts } from "@/services/productService";
import { getAllCategories } from "@/services/categoryService";
import { ProductActions } from "./_components/product-actions";
import type { Product, Category } from "@/lib/types";

// Revalidate this page every 30 seconds
export const revalidate = 30;

export default async function AdminProductsPage() {
  const products: Product[] = await getAllProducts();
  const categories: Category[] = await getAllCategories();

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
