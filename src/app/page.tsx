
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
      <section className="relative h-[60vh] md:h-[80vh] w-full">
        <Image
          src={homepageSettings?.heroImageUrl || "https://placehold.co/1800x1200.png"}
          alt="Elegant jewelry on display"
          layout="fill"
          objectFit="cover"
          className="brightness-50"
          data-ai-hint="lifestyle jewelry"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline mb-4 drop-shadow-lg">
            Timeless Elegance, Redefined
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8 font-body drop-shadow-md">
            Discover exquisite jewelry that tells your story. Crafted with passion, designed for forever.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-8 px-10 rounded-full shadow-lg transition-transform transform hover:scale-105">
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
            <Button asChild variant="link" className="text-accent text-lg font-bold hover:text-accent/80">
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
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="relative h-80">
                    <Image src="https://placehold.co/800x600.png" alt="Seasonal Sale" layout="fill" objectFit="cover" data-ai-hint="jewelry sale"/>
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-6 text-center">
                        <h3 className="font-headline text-3xl mb-2">Seasonal Sale</h3>
                        <p className="mb-4">Up to 30% off on select collections.</p>
                        <Button variant="secondary" asChild>
                            <Link href="/products?tag=sale">Shop Now</Link>
                        </Button>
                    </div>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="relative h-80">
                    <Image src="https://placehold.co/800x600.png" alt="Festive Discounts" layout="fill" objectFit="cover" data-ai-hint="diamond ring"/>
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-6 text-center">
                        <h3 className="font-headline text-3xl mb-2">Festive Discounts</h3>
                        <p className="mb-4">Shine brighter with our exclusive festive offers.</p>
                         <Button variant="secondary" asChild>
                            <Link href="/products?tag=festive">Explore Offers</Link>
                        </Button>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
