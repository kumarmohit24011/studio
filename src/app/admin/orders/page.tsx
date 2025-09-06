

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllOrders } from "@/services/orderService";
import { OrderActions } from "./_components/order-actions";
import type { Order } from "@/lib/types";

export default async function AdminOrdersPage() {
  const ordersData = await getAllOrders();
  
  const orders = ordersData.map(o => ({
    ...o,
    createdAt: o.createdAt ? new Date(o.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
    updatedAt: o.updatedAt ? new Date(o.updatedAt.seconds * 1000).toISOString() : new Date().toISOString(),
  })) as Order[];


  return (
     <div className="flex flex-col gap-4">
       <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Orders</h1>
       </div>
        <Card>
            <CardHeader>
            <CardTitle>Manage Orders</CardTitle>
            <CardDescription>
                View and process customer orders.
            </CardDescription>
            </CardHeader>
            <CardContent>
                <OrderActions orders={orders} />
                {orders.length === 0 && (
                    <div className="text-center text-muted-foreground py-12">
                        <p>No orders found.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
