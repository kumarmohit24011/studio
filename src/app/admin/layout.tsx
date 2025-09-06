
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarRail,
  SidebarGroup,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, authLoading, signOutUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading) {
      if (!user || !userProfile?.isAdmin) {
        router.push('/login');
      }
    }
  }, [user, userProfile, authLoading, router]);

  if (authLoading || !userProfile) {
    return (
      <div className="flex min-h-screen">
        <div className="w-64 bg-gray-100 p-4">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  if (!userProfile.isAdmin) {
    return null; // Or a more explicit "access denied" component
  }

  const isActive = (path: string) => pathname === path;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarRail />
        <SidebarHeader>
            <div className="flex items-center gap-2">
                <LayoutDashboard className="w-6 h-6 text-primary" />
                <h1 className="font-headline text-xl font-bold">Admin Panel</h1>
            </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup>
                <SidebarMenu>
                    <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin')}>
                        <Link href="/admin">
                        <Home />
                        Dashboard
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/products')}>
                        <Link href="/admin/products">
                        <Package />
                        Products
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/orders')}>
                        <Link href="/admin/orders">
                        <ShoppingCart />
                        Orders
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/customers')}>
                        <Link href="/admin/customers">
                        <Users />
                        Customers
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/settings')}>
                        <Link href="/admin/settings">
                        <Settings />
                        Settings
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 p-2 h-auto">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile?.photoURL || ''} />
                  <AvatarFallback>{userProfile?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium">{userProfile.name}</p>
                  <p className="text-xs text-muted-foreground">{userProfile.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/account">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/">Back to Site</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOutUser}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 md:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
