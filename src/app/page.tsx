
import { Button } from "@/components/ui/button";
import { getNewArrivals, getTrendingProducts } from "@/services/productService";
import { getHeroSection } from "@/services/siteContentService";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "./products/_components/product-card";

export default async function Home() {
  const newArrivals = await getNewArrivals(4);
  const trendingProducts = await getTrendingProducts(4);
  const heroData = await getHeroSection();

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative h-[50vh] flex items-center justify-center text-center text-white bg-gray-800">
        {heroData.imageUrl && (
          <Image
            src={heroData.imageUrl}
            alt="Elegant jewelry on a dark background"
            data-ai-hint="jewelry dark"
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="relative z-10 p-4 bg-black bg-opacity-40 rounded-lg">
          <h1 className="text-5xl font-headline font-bold">{heroData.headline}</h1>
          <p className="mt-4 text-xl">{heroData.subtitle}</p>

          <Button asChild className="mt-6">
            <Link href={heroData.buttonLink}>{heroData.buttonText}</Link>
          </Button>
        </div>
      </section>

      <section id="new-arrivals" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-headline text-center mb-8">New Arrival</h2>
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
                src="https://picsum.photos/600/400"
                alt="Festive sale on necklaces"
                data-ai-hint="jewelry sale"
                fill
                className="object-cover brightness-75"
              />
              <div className="relative z-10">
                <h3 className="text-2xl font-headline font-bold">Festive Discounts</h3>
                <p className="mt-2">Up to 30% off on select necklaces</p>
                <Button asChild className="mt-4" variant="secondary">
                  <Link href="/products?category=Necklaces">Shop Now</Link>
                </Button>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden h-64 flex items-center justify-center text-white text-center p-4">
              <Image
                src="https://picsum.photos/600/400?grayscale"
                alt="Limited time offer on rings"
                data-ai-hint="ring promotion"
                fill
                className="object-cover brightness-75"
              />
              <div className="relative z-10">
                <h3 className="text-2xl font-headline font-bold">Limited Time Offer</h3>
                <p className="mt-2">Buy one, get one 50% off on wedding rings</p>
                <Button asChild className="mt-4" variant="secondary">
                  <Link href="/products?category=Rings">Explore Rings</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
