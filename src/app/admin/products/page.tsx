
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getAllProducts } from "@/services/productService";
import { ProductTable } from "./_components/product-table";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="flex flex-col gap-4">
       <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Products</h1>
        <div className="ml-auto flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1" asChild>
                <Link href="/admin/products/new">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add Product
                    </span>
                </Link>
            </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Products</CardTitle>
          <CardDescription>
            Here you can add, edit, and delete products.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductTable products={products} />
        </CardContent>
      </Card>
    </div>
  );
}
