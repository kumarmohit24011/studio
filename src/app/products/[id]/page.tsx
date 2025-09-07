
import { getProductById, getProductsByCategory } from "@/services/productService";
import { notFound } from "next/navigation";
import type { Product } from "@/lib/types";
import { ProductDetailsClient } from "./_components/product-details-client";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "../_components/product-card";

type ProductPageProps = {
  params: {
    id: string;
  };
};

// Helper to convert Firestore Timestamps to a serializable format
const toPlainObject = (product: any): Product => {
    return {
        ...product,
        createdAt: product.createdAt?.seconds ? new Date(product.createdAt.seconds * 1000).toISOString() : null,
        updatedAt: product.updatedAt?.seconds ? new Date(product.updatedAt.seconds * 1000).toISOString() : null,
    };
};

export default async function ProductPage({ params }: ProductPageProps) {
  const productData = await getProductById(params.id);

  if (!productData || !productData.isPublished) {
    notFound();
  }
  
  const product = toPlainObject(productData);

  // Fetch related products (from the same category, excluding the current one)
  const relatedProductsData = await getProductsByCategory(product.category);
  const relatedProducts = relatedProductsData
    .filter(p => p.id !== product.id)
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
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
