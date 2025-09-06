
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { Button } from '@/components/ui/button';
import { MoreHorizontal, PackageCheck, Truck, XCircle, CircleAlert } from 'lucide-react';
import type { Order } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { updateOrderStatus } from '@/services/orderService';
import { Separator } from '@/components/ui/separator';

type OrderStatus = Order['orderStatus'];

export function OrderActions({ orders }: { orders: Order[] }) {
    const { toast } = useToast();
    const router = useRouter();

    const handleStatusChange = async (orderId: string, status: OrderStatus) => {
        try {
            await updateOrderStatus(orderId, status);
            toast({ title: "Success", description: `Order status updated to ${status}.` });
            router.refresh(); // Refresh data on the page
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update order status." });
        }
    }
    
    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'delivered': return 'bg-green-500';
            case 'shipped': return 'bg-blue-500';
            case 'processing': return 'bg-yellow-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    }

  return (
    <Accordion type="single" collapsible className="w-full">
         {orders.map((order) => (
            <AccordionItem value={order.id} key={order.id}>
                <AccordionTrigger className="hover:no-underline">
                     <div className="w-full">
                        <Table>
                            <TableHeader className='sr-only'>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="border-none">
                                    <TableCell className="font-medium w-1/5">#{order.id.slice(0, 7)}...</TableCell>
                                    <TableCell className="w-1/4">{order.shippingAddress.name}</TableCell>
                                    <TableCell className="w-1/5">{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</TableCell>
                                    <TableCell className="w-1/5">
                                        <Badge variant={order.orderStatus === 'delivered' ? 'default' : 'secondary'} className="capitalize">
                                             <span className={cn('h-2 w-2 rounded-full mr-2', getStatusColor(order.orderStatus))}></span>
                                            {order.orderStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right w-1/6">₹{order.totalAmount.toFixed(2)}</TableCell>
                                     <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'processing')}>
                                                    <CircleAlert className="mr-2 h-4 w-4" /> Processing
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'shipped')}>
                                                    <Truck className="mr-2 h-4 w-4" /> Shipped
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'delivered')}>
                                                    <PackageCheck className="mr-2 h-4 w-4" /> Delivered
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-500" onClick={() => handleStatusChange(order.id, 'cancelled')}>
                                                    <XCircle className="mr-2 h-4 w-4" /> Cancelled
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                     </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="p-4 bg-muted/50 rounded-md">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-2">Order Items</h4>
                                <ul className="space-y-2">
                                    {order.items.map(item => (
                                        <li key={item.productId} className='flex justify-between text-sm'>
                                            <span>{item.name} (x{item.quantity})</span>
                                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Separator className="my-3"/>
                                <div className="flex justify-between font-semibold text-sm">
                                    <span>Total</span>
                                    <span>₹{order.totalAmount.toFixed(2)}</span>
                                </div>
                                {order.discountAmount && order.discountAmount > 0 && (
                                     <div className="flex justify-between text-sm text-primary">
                                        <span>Discount ({order.couponCode})</span>
                                        <span>- ₹{order.discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Shipping To</h4>
                                <div className="text-sm text-muted-foreground">
                                    <p className='font-medium text-foreground'>{order.shippingAddress.name}</p>
                                    <p>{order.shippingAddress.street}, {order.shippingAddress.city}</p>
                                    <p>{order.shippingAddress.state}, {order.shippingAddress.zipCode}</p>
                                    <p>{order.shippingAddress.country}</p>
                                    <p className="mt-2">Payment ID: <span className="font-mono text-xs bg-muted p-1 rounded">{order.razorpayPaymentId}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
         ))}
     </Accordion>
  );
}

// Small helper to avoid className clutter
const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');
