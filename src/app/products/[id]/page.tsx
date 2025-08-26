
import { getProduct, getProducts } from "@/services/productService";
import { ProductClientPage } from "./ProductClientPage";
import { Metadata } from "next";

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: "Product Not Found",
    }
  }

  return {
    title: `${product.name} - Redbow`,
    description: product.description,
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);
  const allProducts = await getProducts();
  
  if (!product) {
    return <div className="container mx-auto px-4 py-12 text-center">Product not found.</div>;
  }

  const relatedProducts = allProducts.filter(rp => rp.id !== product.id && rp.category === product.category).slice(0, 4);

  return <ProductClientPage product={product} relatedProducts={relatedProducts} />;
}
