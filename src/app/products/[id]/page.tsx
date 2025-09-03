
import { getProductById } from "@/services/productService";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "./_components/add-to-cart-button";
import { AddToWishlistButton } from "./_components/add-to-wishlist-button";

type ProductPageProps = {
  params: {
    id: string;
  };
};

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="relative aspect-square rounded-lg overflow-hidden">
          <Image
            src={product.imageUrl || "https://picsum.photos/600/600"}
            alt={product.name}
            data-ai-hint="jewelry product"
            fill
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-4xl font-headline font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
                {product.tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
            </div>
          </div>

          <p className="text-3xl font-semibold text-primary">₹{product.price.toFixed(2)}</p>
          
          <p className="text-muted-foreground text-lg leading-relaxed">{product.description}</p>
          
          <div className="flex items-center gap-4">
            <AddToCartButton product={product} />
            <AddToWishlistButton product={product} />
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            <p>Category: <Button variant="link" className="p-0 h-auto" asChild><a href={`/products?category=${product.category}`}>{product.category}</a></Button></p>
            <p>In Stock: {product.stock > 0 ? `${product.stock} units` : 'Out of Stock'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
