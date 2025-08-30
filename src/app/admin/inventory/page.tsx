
"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/placeholder-data";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getProducts } from "@/services/productService";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const products = await getProducts();
    setProducts(products);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { text: "Out of Stock", color: "bg-red-600" };
    if (stock <= 10) return { text: "Low Stock", color: "bg-yellow-500" };
    return { text: "In Stock", color: "bg-green-600" };
  };
  
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const productsInStock = products.filter(p => p.stock > 0).length;

  if (loading) {
    return <div>Loading inventory...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
       <div className="grid gap-4 md:grid-cols-2">
           <Card>
               <CardHeader>
                   <CardTitle>Total Products</CardTitle>
               </CardHeader>
               <CardContent>
                   <div className="text-2xl font-bold">{products.length}</div>
                   <p className="text-xs text-muted-foreground">{productsInStock} unique products in stock</p>
               </CardContent>
           </Card>
            <Card>
               <CardHeader>
                   <CardTitle>Total Units in Stock</CardTitle>
               </CardHeader>
               <CardContent>
                   <div className="text-2xl font-bold">{totalStock}</div>
                    <p className="text-xs text-muted-foreground">Across all products</p>
               </CardContent>
           </Card>
       </div>
      <Card>
        <CardHeader>
          <CardTitle>Inventory Levels</CardTitle>
          <CardDescription>
            Track and manage your product stock levels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const status = getStockStatus(product.stock);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                         <Image
                            alt={product.name}
                            className="aspect-square rounded-md object-cover"
                            height="64"
                            src={product.images[0]}
                            width="64"
                            data-ai-hint="jewelry"
                        />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell className="text-center font-medium">{product.stock}</TableCell>
                    <TableCell className="text-right">
                      <Badge className={cn("text-white", status.color)}>
                        {status.text}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
