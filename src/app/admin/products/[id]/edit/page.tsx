
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "../../_components/product-form";
import { getProductById } from "@/services/productService";
import { getAllCategories } from "@/services/categoryService";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);
  const categories = await getAllCategories();
  
  if (!product) {
    notFound();
  }

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
