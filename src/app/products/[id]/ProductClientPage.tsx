
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/lib/placeholder-data";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Star, Truck, ShieldCheck, Heart } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

export function ProductClientPage({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if(product) {
      addToCart(product);
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
    }
  }
  
  const stockStatus =
    product.stock > 10
      ? { text: "In Stock", color: "bg-green-600" }
      : product.stock > 0
      ? { text: "Low Stock", color: "bg-yellow-500" }
      : { text: "Sold Out", color: "bg-red-600" };
  
  const formattedPrice = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price);
  const discountedPrice = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price * 0.8);


  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div>
          <Carousel className="w-full">
            <CarouselContent>
              {product.images.map((img, index) => (
                <CarouselItem key={index}>
                  <Card className="overflow-hidden">
                    <CardContent className="p-0 aspect-square relative">
                      <Image
                        src={img}
                        alt={`${product.name} image ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint="jewelry"
                      />
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4" />
            <CarouselNext className="absolute right-4" />
          </Carousel>
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-3xl md:text-4xl font-headline font-bold">{product.name}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < 4 ? "text-accent fill-accent" : "text-gray-300"}`} />
              ))}
            </div>
            <span className="text-muted-foreground text-sm">(123 reviews)</span>
          </div>
          
          <div className="text-2xl md:text-3xl font-bold flex items-baseline gap-3">
            <span className="text-accent">{discountedPrice}</span>
            <span className="text-muted-foreground line-through text-xl">{formattedPrice}</span>
          </div>
          
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          <div className="flex items-center gap-2">
            <Badge className={`${stockStatus.color} text-white`}>{stockStatus.text}</Badge>
            <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
          </div>
          <Separator />

          <div>
            <Label className="text-base font-medium mb-2 block">Select Size</Label>
            <RadioGroup defaultValue="7" className="flex items-center gap-2">
                {['6', '7', '8', '9'].map(size => (
                    <div key={size}>
                        <RadioGroupItem value={size} id={`size-${size}`} className="sr-only" />
                        <Label htmlFor={`size-${size}`} className="flex items-center justify-center rounded-md border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary w-10 h-10 cursor-pointer">
                            {size}
                        </Label>
                    </div>
                ))}
            </RadioGroup>
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <Button size="lg" className="flex-1" disabled={product.stock === 0} onClick={handleAddToCart}>
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="p-3">
              <Heart className="h-6 w-6" />
              <span className="sr-only">Add to Wishlist</span>
            </Button>
          </div>

          <Accordion type="single" collapsible className="w-full mt-4">
            <AccordionItem value="item-1">
              <AccordionTrigger>Product Details</AccordionTrigger>
              <AccordionContent>
                Metal: {product.metal} <br/>
                Gemstone: {product.gemstone || 'N/A'} <br/>
                Category: {product.category}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Shipping & Returns</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-accent"/>
                    <span>Free shipping on all orders.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-accent"/>
                    <span>30-day return policy for hassle-free returns.</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <div className="mt-20 md:mt-32">
        <h2 className="text-3xl font-headline text-center mb-12">You Might Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map(p => <ProductCard key={p.id} product={p}/>)}
        </div>
      </div>
    </div>
  );
}
