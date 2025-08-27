
"use client";

import { Product } from "@/lib/placeholder-data";
import { ProductCard } from "@/components/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { getProducts } from "@/services/productService";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Rings", "Necklaces", "Bracelets", "Earrings"];
type SortOption = "newest" | "price-asc" | "price-desc" | "popularity";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const allProducts = await getProducts();
      setProducts(allProducts);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const sortedAndFilteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory !== "All") {
      filtered = products.filter(p => p.category === selectedCategory);
    }
    
    switch (sortOption) {
      case "price-asc":
        return [...filtered].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...filtered].sort((a, b) => b.price - a.price);
      case "popularity":
         return [...filtered].sort((a, b) => {
            const aIsTrending = a.tags?.includes('trending') ? 1 : 0;
            const bIsTrending = b.tags?.includes('trending') ? 1 : 0;
            return bIsTrending - aIsTrending;
        });
      case "newest":
      default:
         return [...filtered].sort((a, b) => {
            const aIsNew = a.tags?.includes('new') ? 1 : 0;
            const bIsNew = b.tags?.includes('new') ? 1 : 0;
            return bIsNew - aIsNew;
        });
    }

  }, [products, selectedCategory, sortOption]);

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline">Our Collection</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our hand-selected range of fine jewelry, crafted to perfection for every moment.
        </p>
      </div>

      <main>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b">
           <div className="flex items-center gap-2">
               {CATEGORIES.map(category => (
                   <Button
                    key={category}
                    variant="ghost"
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                        "rounded-none text-muted-foreground hover:text-primary pb-2 border-b-2 h-auto px-3 py-1 text-base",
                        selectedCategory === category ? "border-primary text-primary" : "border-transparent"
                    )}
                   >
                       {category}
                   </Button>
               ))}
           </div>
            <div className="flex items-center gap-4">
                <p className="text-muted-foreground text-sm">{sortedAndFilteredProducts.length} products</p>
                <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="newest">New Arrivals</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="popularity">Popularity</SelectItem>
                </SelectContent>
                </Select>
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sortedAndFilteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}
