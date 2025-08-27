
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
import { Order } from "@/lib/types";
import {
  MoreHorizontal,
  FileDown,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus } from "@/services/orderService";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const statusColors = {
  Processing: "bg-blue-500",
  Shipped: "bg-yellow-500",
  Delivered: "bg-green-600",
  Cancelled: "bg-red-600",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    const allOrders = await getAllOrders();
    setOrders(allOrders);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (
    orderId: string,
    status: Order["orderStatus"]
  ) => {
    try {
      await updateOrderStatus(orderId, status);
      toast({ title: "Success", description: "Order status updated." });
      fetchOrders();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status.",
      });
    }
  };

  const renderOrdersTable = (filteredOrders: Order[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredOrders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">#{order.id.substring(0, 7)}</TableCell>
            <TableCell>{order.shippingAddress.name}</TableCell>
            <TableCell>
              {new Date(order.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Badge
                className={cn(
                  "text-white",
                  statusColors[order.orderStatus] || "bg-gray-500"
                )}
              >
                {order.orderStatus}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              ₹{order.totalAmount.toFixed(2)}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>View Order Details</DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <span>Update Status</span>
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(order.id, "Processing")
                          }
                        >
                          Processing
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(order.id, "Shipped")
                          }
                        >
                          Shipped
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(order.id, "Delivered")
                          }
                        >
                          Delivered
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(order.id, "Cancelled")
                          }
                        >
                          Cancelled
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <FileDown className="mr-2" />
                    Download Invoice
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (loading) {
    return <div>Loading orders...</div>;
  }

  const orderStatuses: Order["orderStatus"][] = [
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];
  const filteredOrdersByStatus = (status: Order["orderStatus"]) =>
    orders.filter((order) => order.orderStatus === status);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Management</CardTitle>
        <CardDescription>
          View, manage, and process all customer orders.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {orderStatuses.map((status) => (
              <TabsTrigger key={status} value={status}>
                {status}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="all">{renderOrdersTable(orders)}</TabsContent>
          {orderStatuses.map((status) => (
            <TabsContent key={status} value={status}>
              {renderOrdersTable(filteredOrdersByStatus(status))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
