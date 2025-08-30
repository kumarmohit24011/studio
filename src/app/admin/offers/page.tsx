
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function AdminOffersPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Offers & Coupons</CardTitle>
                <CardDescription>Manage your promotional offers and discount codes.</CardDescription>
            </div>
            <Button disabled>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Offer
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-16">
            <h3 className="text-lg font-semibold">Feature Coming Soon</h3>
            <p className="text-muted-foreground mt-2">
                The ability to create and manage coupons is under construction.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
