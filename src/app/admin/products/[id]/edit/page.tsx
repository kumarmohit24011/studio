
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "../../_components/product-form";
import { getProductById } from "@/services/productService";
import { getAllCategories } from "@/services/categoryService";
import { notFound } from "next/navigation";
import type { Product, Category } from "@/lib/types";

export default async function EditProductPage(props: any) {
  const id = props.params?.id;
  const productData = await getProductById(id);
  const categoriesData = await getAllCategories();
  
  if (!productData) {
    notFound();
  }

  // Convert Timestamps to strings
  const product: Product = {
    ...productData,
    createdAt: productData.createdAt ? new Date(productData.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
    updatedAt: productData.updatedAt ? new Date(productData.updatedAt.seconds * 1000).toISOString() : new Date().toISOString(),
  };

  const categories = categoriesData.map(cat => ({
    ...cat,
    createdAt: cat.createdAt ? new Date(cat.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
  })) as Category[];


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Edit Product</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Update the form below to edit the product details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm product={product} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
