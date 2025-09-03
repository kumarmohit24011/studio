
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getNewArrivals } from "@/services/productService";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function Home() {
  const newArrivals = await getNewArrivals(4);

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative h-[60vh] flex items-center justify-center text-center text-white bg-gray-800">
        <Image
          src="https://picsum.photos/1800/1000"
          alt="Elegant jewelry on a dark background"
          data-ai-hint="jewelry dark"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-10 p-4 bg-black bg-opacity-40 rounded-lg">
          <h1 className="text-5xl font-headline font-bold">Timeless Elegance, Redefined</h1>
          <p className="mt-4 text-xl">Discover our exclusive collection of handcrafted jewelry.</p>
          <Button asChild className="mt-6">
            <Link href="/products">Shop Now</Link>
          </Button>
        </div>
      </section>

      <section id="new-arrivals" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-headline text-center mb-8">New Arrival</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newArrivals.map((product) => (
              <Card key={product.id} className="overflow-hidden group">
                <Link href={`/products/${product.id}`}>
                  <CardContent className="p-0">
                    <div className="relative w-full aspect-square">
                      <Image
                        src={product.imageUrl || "https://picsum.photos/400/400"}
                        alt={product.name}
                        data-ai-hint="jewelry product"
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {product.tags?.includes('new') && <Badge className="absolute top-2 left-2">New</Badge>}
                      {product.tags?.includes('sale') && <Badge variant="destructive" className="absolute top-2 right-2">Sale</Badge>}
                    </div>
                    <div className="p-4">
                      <h3 className="font-headline text-lg">{product.name}</h3>
                      <p className="text-muted-foreground mt-1">${product.price.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
