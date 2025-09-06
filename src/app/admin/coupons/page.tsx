
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllCoupons } from "@/services/couponService";
import { CouponActions } from "./_components/actions";
import type { Coupon } from "@/lib/types";

export default async function AdminCouponsPage() {
  const couponsData = await getAllCoupons();
  
  // Convert Firestore Timestamps to a serializable format (ISO string)
  const coupons = couponsData.map(coupon => ({
    ...coupon,
    createdAt: coupon.createdAt?.seconds ? new Date(coupon.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
  })) as unknown as Coupon[];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Coupons</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Coupons</CardTitle>
          <CardDescription>
            Add, edit, or delete discount coupons for your store.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <CouponActions coupons={coupons} />
        </CardContent>
      </Card>
    </div>
  );
}
