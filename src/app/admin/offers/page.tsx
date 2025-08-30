
"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Coupon, getCoupons, deleteCoupon } from "@/services/couponService";
import { CouponDialog } from "./CouponDialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function AdminOffersPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const { toast } = useToast();

  const fetchCoupons = async () => {
    setLoading(true);
    const fetchedCoupons = await getCoupons();
    setCoupons(fetchedCoupons);
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAddCoupon = () => {
    setSelectedCoupon(null);
    setIsDialogOpen(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsDialogOpen(true);
  };

  const handleDeleteCoupon = async (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon(id);
        toast({ title: "Success", description: "Coupon deleted successfully." });
        fetchCoupons();
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete coupon." });
      }
    }
  }

  const getStatus = (coupon: Coupon) => {
    const now = new Date();
    const expiry = new Date(coupon.expiryDate);
    if (!coupon.isActive) return { text: "Inactive", color: "bg-gray-500" };
    if (expiry < now) return { text: "Expired", color: "bg-red-600" };
    return { text: "Active", color: "bg-green-600" };
  };

  if (loading) {
    return <div>Loading coupons...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Offers & Coupons</CardTitle>
              <CardDescription>Manage your promotional offers and discount codes.</CardDescription>
            </div>
            <Button onClick={handleAddCoupon}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Offer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Expires On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => {
                const status = getStatus(coupon);
                return (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium">{coupon.code}</TableCell>
                    <TableCell className="capitalize">{coupon.discountType}</TableCell>
                    <TableCell>
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}%`
                        : `₹${coupon.discountValue.toFixed(2)}`}
                    </TableCell>
                    <TableCell>{new Date(coupon.expiryDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={cn("text-white", status.color)}>{status.text}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditCoupon(coupon)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteCoupon(coupon.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <CouponDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={fetchCoupons}
        coupon={selectedCoupon}
      />
    </>
  );
}
