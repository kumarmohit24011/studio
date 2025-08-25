import { products } from "@/lib/placeholder-data";
import { ProductCard } from "@/components/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export default function ProductsPage() {
  const filters = [
    {
      name: "Category",
      options: ["Rings", "Necklaces", "Bracelets", "Earrings"],
    },
    {
      name: "Metal",
      options: ["Gold", "Silver", "Platinum"],
    },
    {
      name: "Gemstone",
      options: ["Diamond", "Ruby", "Sapphire", "Emerald"],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline">Our Collection</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our hand-selected range of fine jewelry, crafted to perfection for every moment.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <div className="sticky top-24">
            <h2 className="text-2xl font-headline mb-4">Filters</h2>
            <Accordion type="multiple" defaultValue={["Category", "Metal", "Price range"]}>
              {filters.map((filter) => (
                <AccordionItem value={filter.name} key={filter.name}>
                  <AccordionTrigger className="text-lg font-body">{filter.name}</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-2">
                      {filter.options.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox id={`${filter.name}-${option}`} />
                          <Label htmlFor={`${filter.name}-${option}`} className="font-normal">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
              <AccordionItem value="Price range">
                  <AccordionTrigger className="text-lg font-body">Price Range</AccordionTrigger>
                  <AccordionContent>
                    <div className="p-2">
                        <Slider
                            defaultValue={[500]}
                            max={5000}
                            step={100}
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-2">
                            <span>$0</span>
                            <span>$5000</span>
                        </div>
                    </div>
                  </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button className="w-full mt-6">Apply Filters</Button>
          </div>
        </aside>

        <main className="md:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">{products.length} products</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="flex justify-center mt-12">
            <Button variant="outline">Load More</Button>
          </div>
        </main>
      </div>
    </div>
  );
}
