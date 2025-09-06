
'use client';

import { useEffect, useState } from 'react';
import { getOrdersByUserId } from '@/services/orderService';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function OrderHistory({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const userOrders = await getOrdersByUserId(userId);
      setOrders(userOrders);
      setLoading(false);
    };
    fetchOrders();
  }, [userId]);

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View your past orders and their status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </CardContent>
        </Card>
    )
  }

  if (orders.length === 0) {
    return (
       <Card>
            <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View your past orders and their status.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="text-center py-16 text-muted-foreground">
                    <p>You haven't placed any orders yet.</p>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>View your past orders and their status.</CardDescription>
        </CardHeader>
        <CardContent>
             <Accordion type="single" collapsible className="w-full">
                {orders.map((order) => (
                <AccordionItem key={order.id} value={order.id}>
                    <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4">
                        <div className='text-left'>
                            <p className="font-semibold">Order #{order.id.slice(0, 7)}...</p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(order.createdAt.seconds * 1000).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                           <p className="font-semibold">₹{order.total.toFixed(2)}</p>
                            <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className='capitalize mt-1'>{order.status}</Badge>
                        </div>
                    </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                             <p className="font-semibold">Items:</p>
                             <ul className="space-y-2">
                                {order.items.map(item => (
                                    <li key={item.productId} className='flex justify-between text-sm'>
                                        <span>{item.name} (x{item.quantity})</span>
                                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                ))}
                             </ul>
                             <p className="font-semibold mt-4">Shipping To:</p>
                             <p className="text-sm text-muted-foreground">
                                {order.shippingAddress.name}<br/>
                                {order.shippingAddress.street}, {order.shippingAddress.city}<br/>
                                {order.shippingAddress.state}, {order.shippingAddress.zipCode}<br/>
                                {order.shippingAddress.country}
                             </p>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
    </Card>
  );
}

