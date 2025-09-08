
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllOrders, getOrdersByUserId } from "@/services/orderService";
import { OrderActions } from "./_components/order-actions";
import type { Order } from "@/lib/types";
import { getUserProfile } from "@/services/userService";

export default async function AdminOrdersPage(props: any) {
  const customerId = props?.searchParams?.customerId as string | undefined;

  const ordersData = customerId
    ? await getOrdersByUserId(customerId)
    : await getAllOrders();

  const customer = customerId ? await getUserProfile(customerId) : null;

  // Ensure all data passed to the client component is serializable
  const orders: Order[] = ordersData.map((o: any) => ({
    ...o,
    createdAt: o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toISOString() : new Date(0).toISOString(),
    updatedAt: o.updatedAt?.seconds ? new Date(o.updatedAt.seconds * 1000).toISOString() : new Date(0).toISOString(),
  }));

  const title =
    customerId && customer ? `Orders for ${customer.name}` : "Manage Orders";

  const description = customerId
    ? `Viewing all orders placed by ${customer?.email}`
    : "View and process customer orders. Filter by status using the tabs below.";

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
