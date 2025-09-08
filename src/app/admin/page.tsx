
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllOrders } from "@/services/orderService";
import { getRecentCustomers, getTotalCustomers } from "@/services/userService";
import { getAllProducts, getRecentProducts, getTotalProducts } from "@/services/productService";
import { getAllCategories } from "@/services/categoryService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserProfile, Product } from "@/lib/types";


const toPlainObject = (item: any): any => {
    const plain = { ...item };
    if (item.createdAt?.seconds) {
        plain.createdAt = new Date(item.createdAt.seconds * 1000).toISOString();
    }
    if (item.updatedAt?.seconds) {
        plain.updatedAt = new Date(item.updatedAt.seconds * 1000).toISOString();
    }
    return plain;
};

export default async function AdminDashboard() {
    const recentOrdersData = await getAllOrders(); // In a real app, you'd paginate this.
    const recentCustomersData = await getRecentCustomers(5);
    const recentProductsData = await getRecentProducts(5);
    
    const totalCustomers = await getTotalCustomers();
    const totalProducts = await getTotalProducts();
    const totalCategories = (await getAllCategories()).length;
    
    const recentOrders = recentOrdersData.map(toPlainObject);
    const recentCustomers: UserProfile[] = recentCustomersData.map(toPlainObject);
    const recentProducts: Product[] = recentProductsData.map(toPlainObject);

    const totalRevenue = recentOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);


  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Revenue
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                        From all processed orders
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{recentOrders.length}</div>
                     <p className="text-xs text-muted-foreground">
                        Total orders placed
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalCustomers}</div>
                    <p className="text-xs text-muted-foreground">
                        Total registered users
                    </p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalProducts}</div>
                     <p className="text-xs text-muted-foreground">
                        Across {totalCategories} categories
                    </p>
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <Card className="xl:col-span-2">
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>
                            The latest transactions from your store.
                        </CardDescription>
                    </div>
                    <Button asChild size="sm" className="ml-auto gap-1">
                        <Link href="/admin/orders">
                            View All
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {recentOrders.slice(0, 5).map(order => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <div className="font-medium">{order.shippingAddress.name}</div>
                                        <div className="text-sm text-muted-foreground">Order #{order.id.slice(0,7)}</div>
                                    </TableCell>
                                    <TableCell className="text-right">₹{order.totalAmount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     {recentOrders.length === 0 && (
                        <div className="text-center text-muted-foreground py-12">
                            <p>No recent transactions.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Customers</CardTitle>
                     <CardDescription>
                        The latest users who signed up.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-8">
                     {recentCustomers.map(customer => (
                        <div key={customer.uid} className="flex items-center gap-4">
                           <Avatar className="hidden h-9 w-9 sm:flex">
                                <AvatarImage src={customer.photoURL} alt="Avatar" />
                                <AvatarFallback>{customer.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium leading-none">{customer.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {customer.email}
                                </p>
                            </div>
                        </div>
                     ))}
                     {recentCustomers.length === 0 && (
                        <div className="text-center text-muted-foreground pt-4">
                            <p>No new customers yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
         <div className="grid gap-4 md:gap-8">
             <Card>
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                        <CardTitle>Recently Added Products</CardTitle>
                        <CardDescription>
                            The newest items in your inventory.
                        </CardDescription>
                    </div>
                    <Button asChild size="sm" className="ml-auto gap-1">
                        <Link href="/admin/products">
                            View All
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {recentProducts.map(product => (
                                <TableRow key={product.id}>
                                     <TableCell className="hidden sm:table-cell">
                                        <Avatar className="h-12 w-12 rounded-md">
                                             <AvatarImage src={product.imageUrl} alt={product.name} className="object-cover" />
                                             <AvatarFallback><Package/></AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{product.name}</div>
                                    </TableCell>
                                     <TableCell>
                                        <div className="font-medium">{product.category}</div>
                                    </TableCell>
                                    <TableCell className="text-right">₹{product.price.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     {recentProducts.length === 0 && (
                        <div className="text-center text-muted-foreground py-12">
                            <p>No products have been added yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
