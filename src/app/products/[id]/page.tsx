
'use client';

import { getProductById } from "@/services/productService";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "./_components/add-to-cart-button";
import { AddToWishlistButton } from "./_components/add-to-wishlist-button";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";

type ProductPageProps = {
  params: {
    id: string;
  };
};

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const fetchedProduct = await getProductById(params.id);
      if (fetchedProduct) {
        setProduct(fetchedProduct);
        setMainImage(fetchedProduct.imageUrl || (fetchedProduct.imageUrls && fetchedProduct.imageUrls[0]));
      }
      setLoading(false);
    };
    fetchProduct();
  }, [params.id]);


  if (loading) {
    return <div>Loading...</div>
  }

  if (!product) {
    notFound();
  }

  const allImages = [product.imageUrl, ...(product.imageUrls || [])].filter(
    (url, index, self) => url && self.indexOf(url) === index
  ) as string[];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="flex flex-col gap-4">
             <div className="relative aspect-square rounded-lg overflow-hidden border">
                <Image
                    src={mainImage || "https://picsum.photos/600/600"}
                    alt={product.name}
                    data-ai-hint="jewelry product"
                    fill
                    className="object-cover"
                />
            </div>
             {allImages.length > 1 && (
                 <div className="grid grid-cols-5 gap-2">
                     {allImages.map((img, index) => (
                         <button key={index} onClick={() => setMainImage(img)} className={`relative aspect-square rounded-md overflow-hidden border-2 ${mainImage === img ? 'border-primary' : 'border-transparent'}`}>
                             <Image
                                src={img}
                                alt={`${product.name} thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                             />
                         </button>
                     ))}
                 </div>
             )}
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
