
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllOrders, getOrdersByUserId } from "@/services/orderService";
import { OrderActions } from "./_components/order-actions";
import type { Order } from "@/lib/types";
import { getUserProfile } from "@/services/userService";

// Revalidate this page every 30 seconds
export const revalidate = 30;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const customerId = resolvedSearchParams?.customerId as string | undefined;

  // The service now returns serializable data directly
  const orders: Order[] = customerId
    ? await getOrdersByUserId(customerId)
    : await getAllOrders();

  const customer = customerId ? await getUserProfile(customerId) : null;

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
          <CardTitle className="font-headline">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <OrderActions orders={orders} />
        </CardContent>
      </Card>
    </div>
  );
}
