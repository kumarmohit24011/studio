
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
import { getCategories } from "@/services/categoryService";
import { Category } from "@/services/categoryService";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

type SortOption = "newest" | "price-asc" | "price-desc" | "popularity";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [allProducts, allCategories] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(allProducts);
      setCategories(allCategories);
      setLoading(false);
    };
    fetchData();
  }, []);

  const sortedAndFilteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory !== "All") {
      filtered = products.filter(p => p.category === selectedCategory);
    }

    if (searchQuery) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
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

  }, [products, selectedCategory, sortOption, searchQuery]);
  
  const displayCategories = useMemo(() => [{ id: 'all', name: 'All' }, ...categories], [categories]);

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline">
          {searchQuery ? `Search Results for "${searchQuery}"` : "Our Collection"}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our hand-selected range of fine jewelry, crafted to perfection for every moment.
        </p>
      </div>

      <main>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b">
           <div className="flex items-center gap-2 overflow-x-auto pb-2">
               {displayCategories.map(category => (
                   <Button
                    key={category.id}
                    variant="ghost"
                    onClick={() => setSelectedCategory(category.name)}
                    className={cn(
                        "rounded-none text-muted-foreground hover:text-primary border-b-2 flex-shrink-0",
                        selectedCategory === category.name ? "border-primary text-primary" : "border-transparent"
                    )}
                   >
                       {category.name}
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
          {sortedAndFilteredProducts.length > 0 ? (
            sortedAndFilteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="text-muted-foreground col-span-full text-center">No products found.</p>
          )}
        </div>
      </main>
    </div>
  );
}
