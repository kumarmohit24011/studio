
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "../../_components/product-form";
import { getProductById } from "@/services/productService";
import { getAllCategories } from "@/services/categoryService";
import { notFound } from "next/navigation";
import type { Product, Category } from "@/lib/types";

export default async function EditProductPage(props: any) {
  const id = props.params?.id;
  const productData = await getProductById(id);
  
  if (!productData) {
    notFound();
  }

  // The service now returns serializable data, so no need for client-side conversion.
  const categories: Category[] = await getAllCategories();

  // Convert Timestamps to strings for the single product
  const product: Product = {
    ...productData,
    createdAt: productData.createdAt ? new Date(productData.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
    updatedAt: productData.updatedAt ? new Date(productData.updatedAt.seconds * 1000).toISOString() : new Date().toISOString(),
  };

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
