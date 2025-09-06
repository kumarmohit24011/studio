

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllOrders, getOrdersByUserId } from "@/services/orderService";
import { OrderActions } from "./_components/order-actions";
import type { Order } from "@/lib/types";
import { getUserProfile } from "@/services/userService";

interface AdminOrdersPageProps {
  searchParams?: {
    customerId?: string;
  }
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const customerId = searchParams?.customerId;
  const ordersData = customerId ? await getOrdersByUserId(customerId) : await getAllOrders();
  const customer = customerId ? await getUserProfile(customerId) : null;
  
  // Ensure all data passed to the client component is serializable
  const orders = ordersData.map(o => ({
    ...o,
    createdAt: new Date(o.createdAt.seconds * 1000).toISOString(),
    updatedAt: new Date(o.updatedAt.seconds * 1000).toISOString(),
  })) as unknown as Order[];

  const title = customerId && customer ? `Orders for ${customer.name}` : 'Manage Orders';
  const description = customerId ? `Viewing all orders placed by ${customer?.email}` : 'View and process customer orders. Filter by status using the tabs below.';


  return (
     <div className="flex flex-col gap-4">
       <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Orders</h1>
       </div>
        <Card>
            <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <OrderActions orders={orders} />
            </CardContent>
        </Card>
    </div>
  );
}
