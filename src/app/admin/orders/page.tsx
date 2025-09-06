

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllOrders } from "@/services/orderService";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();
  
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
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map(order => (
                             <TableRow key={order.id}>
                                <TableCell className="font-medium">#{order.id.slice(0, 7)}...</TableCell>
                                <TableCell>{order.shippingAddress.name}</TableCell>
                                <TableCell>{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge variant={order.orderStatus === 'delivered' ? 'default' : 'secondary'} className="capitalize">
                                        {order.orderStatus}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">₹{order.totalAmount.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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
