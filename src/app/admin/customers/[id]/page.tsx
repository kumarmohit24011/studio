
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserProfile } from "@/services/userService";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { OrderHistory } from "@/app/account/_components/order-history";
import { Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getOrdersByUserId } from "@/services/orderService";
import type { Order, StoredAddress } from "@/lib/types";
  
const toPlainObject = (data: any) => {
    if (data?.createdAt?.seconds) {
        data.createdAt = new Date(data.createdAt.seconds * 1000).toISOString();
    }
     if (data?.updatedAt?.seconds) {
        data.updatedAt = new Date(data.updatedAt.seconds * 1000).toISOString();
    }
    return data;
}

export default async function CustomerDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const id = params?.id;
    if (!id) {
        notFound();
    }
    const userProfile = await getUserProfile(id);

  if (!userProfile) {
    notFound();
  }

  const ordersData = await getOrdersByUserId(userProfile.uid);
  const orders: Order[] = ordersData.map(toPlainObject);

  return (
    <div className="flex flex-col gap-4">
      {/* User Header */}
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={userProfile.photoURL} />
          <AvatarFallback>{userProfile.name?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{userProfile.name}</h1>
          <p className="text-muted-foreground">{userProfile.email}</p>
          {userProfile.isAdmin && (
            <Badge variant="destructive" className="mt-2">
              Admin
            </Badge>
          )}
        </div>
        <Button asChild className="ml-auto">
          <Link href={`/admin/orders?customerId=${userProfile.uid}`}>
            View All Orders
          </Link>
        </Button>
      </div>

      {/* Orders + Addresses */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <OrderHistory userId={userProfile.uid} initialOrders={orders} />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Saved Addresses</CardTitle>
              <CardDescription>
                Customer&apos;s saved shipping addresses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userProfile.addresses && userProfile.addresses.length > 0 ? (
                userProfile.addresses.map((addr: StoredAddress) => (
                  <div
                    key={addr.id}
                    className="text-sm p-3 rounded-md border bg-muted/30 relative"
                  >
                    {addr.isDefault && (
                      <Badge className="absolute -top-2 -right-2">Default</Badge>
                    )}
                    <p className="font-semibold">{addr.name}</p>
                    <p className="text-muted-foreground">
                      {addr.street}, {addr.city}
                    </p>
                    <p className="text-muted-foreground">
                      {addr.state}, {addr.zipCode}
                    </p>
                    <p className="text-muted-foreground">{addr.country}</p>
                    <p className="text-muted-foreground mt-2">{addr.phone}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Home className="mx-auto h-8 w-8 mb-2" />
                  <p>No saved addresses.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
