
import { Button } from "@/components/ui/button";
import { getNewArrivals, getTrendingProducts } from "@/services/productService";
import { getSiteContent } from "@/services/siteContentService";
import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "./products/_components/product-card";

// Helper to convert Firestore Timestamps
const toPlainObject = (product: any): Product => {
    return {
        ...product,
        createdAt: product.createdAt?.seconds ? new Date(product.createdAt.seconds * 1000).toISOString() : null,
        updatedAt: product.updatedAt?.seconds ? new Date(product.updatedAt.seconds * 1000).toISOString() : null,
    };
};

export default async function Home() {
  const newArrivalsData = await getNewArrivals(4);
  const trendingProductsData = await getTrendingProducts(4);
  const siteContent = await getSiteContent();
  const { heroSection, promoBanner1, promoBanner2 } = siteContent;

  const newArrivals = newArrivalsData.map(toPlainObject);
  const trendingProducts = trendingProductsData.map(toPlainObject);

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative h-[50vh] flex items-center justify-center text-center text-white bg-gray-800">
        {heroSection.imageUrl && (
          <Image
            src={heroSection.imageUrl}
            alt="Elegant jewelry on a dark background"
            data-ai-hint="jewelry dark"
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="relative z-10 p-4 bg-black bg-opacity-40 rounded-lg">
          <h1 className="text-5xl font-headline font-bold">{heroSection.headline}</h1>
          <p className="mt-4 text-xl">{heroSection.subtitle}</p>

          <Button asChild className="mt-6">
            <Link href={heroSection.buttonLink}>{heroSection.buttonText}</Link>
          </Button>
        </div>
      </section>

      <section id="new-arrivals" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-headline text-center mb-8">New Arrivals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section id="trending-products" className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-headline text-center mb-8">Trending Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section id="sale-banners" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative rounded-lg overflow-hidden h-64 flex items-center justify-center text-white text-center p-4">
              <Image
                src={promoBanner1.imageUrl}
                alt={promoBanner1.headline}
                data-ai-hint="jewelry sale"
                fill
                className="object-cover brightness-75"
              />
              <div className="relative z-10">
                <h3 className="text-2xl font-headline font-bold">{promoBanner1.headline}</h3>
                <p className="mt-2">{promoBanner1.subtitle}</p>
                <Button asChild className="mt-4" variant="secondary">
                  <Link href={promoBanner1.buttonLink}>{promoBanner1.buttonText}</Link>
                </Button>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden h-64 flex items-center justify-center text-white text-center p-4">
              <Image
                src={promoBanner2.imageUrl}
                alt={promoBanner2.headline}
                data-ai-hint="ring promotion"
                fill
                className="object-cover brightness-75"
              />
              <div className="relative z-10">
                <h3 className="text-2xl font-headline font-bold">{promoBanner2.headline}</h3>
                <p className="mt-2">{promoBanner2.subtitle}</p>
                <Button asChild className="mt-4" variant="secondary">
                  <Link href={promoBanner2.buttonLink}>{promoBanner2.buttonText}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
