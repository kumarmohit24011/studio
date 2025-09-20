"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tag } from "lucide-react";
import type { Category } from "@/lib/types";

interface ShopByCategoryProps {
  categories: Category[];
}

export function ShopByCategory({ categories }: ShopByCategoryProps) {
  const featuredCategories = categories.filter(category => category.isFeatured);
  
  // If no featured categories, show first 5 categories
  const displayCategories = featuredCategories.length > 0 
    ? featuredCategories.slice(0, 5) 
    : categories.slice(0, 5);

  if (displayCategories.length === 0) {
    return null;
  }

  return (
    <section id="shop-by-category" className="py-16 lg:py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-headline font-bold tracking-tight text-primary mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our diverse collection of jewelry organized by category
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {displayCategories.map((category) => (
            <Card key={category.id} className="overflow-hidden group border bg-card hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <Link 
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="group flex flex-col h-full"
              >
                <div className="relative w-full aspect-square overflow-hidden">
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={`${category.name} jewelry collection`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                      <Tag className="h-12 w-12 text-primary/70" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                </div>
                <CardContent className="p-4 w-full text-center bg-background/80 backdrop-blur-sm">
                   <h3 className="text-foreground font-semibold text-base font-headline">
                      {category.name}
                    </h3>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg">
            <Link href="/products">
              View All Products
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
