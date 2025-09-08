
import { getProductById, getProductsByCategory } from "@/services/productService";
import { notFound } from "next/navigation";
import type { Product } from "@/lib/types";
import { ProductDetailsClient } from "./_components/product-details-client";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "../_components/product-card";

// Helper to convert Firestore Timestamps to a serializable format
const toPlainObject = (product: any): Product => {
    const plainProduct = { ...product };
    if (product.createdAt?.seconds) {
        plainProduct.createdAt = new Date(product.createdAt.seconds * 1000).toISOString();
    }
    if (product.updatedAt?.seconds) {
        plainProduct.updatedAt = new Date(product.updatedAt.seconds * 1000).toISOString();
    }
    return plainProduct;
};

export default async function ProductPage(props: any) {
  const id = props.params?.id;
  const productData = await getProductById(id);

  if (!productData || !productData.isPublished) {
    notFound();
  }
  
  const product = toPlainObject(productData);

  // Fetch related products (from the same category, excluding the current one, limit 5)
  const relatedProductsData = await getProductsByCategory(product.category);
  const relatedProducts = relatedProductsData
    .filter(p => p.id !== product.id && p.isPublished)
    .slice(0, 5)
    .map(toPlainObject);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <ProductDetailsClient product={product} />
        
        {relatedProducts.length > 0 && (
            <div className="mt-16 md:mt-24">
                <Separator />
                <div className="py-12">
                    <h2 className="text-3xl font-headline text-center mb-8">You Might Also Like</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {relatedProducts.map((relatedProduct) => (
                            <ProductCard key={relatedProduct.id} product={relatedProduct} />
                        ))}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
