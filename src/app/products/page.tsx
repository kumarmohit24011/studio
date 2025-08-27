
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const allProducts = await getProducts();
      setProducts(allProducts);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") {
      return products;
    }
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

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
                        "rounded-none text-muted-foreground hover:text-primary pb-3 border-b-2",
                        selectedCategory === category ? "border-primary text-primary" : "border-transparent"
                    )}
                   >
                       {category}
                   </Button>
               ))}
           </div>
            <div className="flex items-center gap-4">
                <p className="text-muted-foreground text-sm">{filteredProducts.length} products</p>
                <Select>
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
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}
