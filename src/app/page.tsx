
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/lib/placeholder-data";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getProducts } from "@/services/productService";
import { getHomepageSettings, HomepageSettings } from "@/services/settingsService";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductsAndSettings = async () => {
      setLoading(true);
      const [allProducts, settings] = await Promise.all([
          getProducts(),
          getHomepageSettings()
      ]);
      setProducts(allProducts);
      setHomepageSettings(settings);
      setLoading(false);
    };
    fetchProductsAndSettings();
  }, []);

  const featuredProducts = products.filter(p => p.tags?.includes('featured')).slice(0, 4);
  const trendingProducts = products.filter(p => p.tags?.includes('trending')).slice(0, 4);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col">
      <section className="relative h-[70vh] w-full">
        <Image
          src={homepageSettings?.heroImageUrl || "https://placehold.co/1800x1200.png"}
          alt="Elegant jewelry on display"
          fill
          objectFit="cover"
          className="brightness-50"
          data-ai-hint="lifestyle jewelry"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
          <h1 className="text-4xl md:text-6xl font-headline mb-4 drop-shadow-md">
            Timeless Elegance
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8 font-body drop-shadow-sm">
            Discover exquisite jewelry that tells your story. Crafted with
            passion, designed for forever.
          </p>
          <Button asChild size="lg">
            <Link href="/products">Shop The Collection</Link>
          </Button>
        </div>
      </section>

      <section id="featured" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline text-center mb-12">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline">
                <Link href="/products">View All Products <ArrowRight className="ml-2 h-5 w-5"/></Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="trending" className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline text-center mb-12">
            Trending Now
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section id="offers" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline text-center mb-12">
            Special Offers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-80">
                    <Image src={homepageSettings?.offerImageUrl1 || "https://placehold.co/800x600.png"} alt="Seasonal Sale" fill objectFit="cover" data-ai-hint="jewelry sale"/>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-80">
                    <Image src={homepageSettings?.offerImageUrl2 || "https://placehold.co/800x600.png"} alt="Festive Discounts" fill objectFit="cover" data-ai-hint="diamond ring"/>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
