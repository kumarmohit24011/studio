
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  Home,
  Users,
  LineChart,
  Settings,
  Tag,
  ShoppingBag,
  Shapes,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: Shapes },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/offers", label: "Offers & Coupons", icon: Tag },
    { href: "/admin/inventory", label: "Inventory", icon: LineChart },
    { href: "/admin/users", label: "User Management", icon: Users },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-8 h-8 text-primary"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.41 7.41L12 12.83l-3.41-3.42-1.42 1.42L12 15.67l4.83-4.84-1.42-1.42z" />
            </svg>
            <span className="text-xl font-headline font-bold">Redbow Admin</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: "right" }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/admin/settings'} tooltip={{children: 'Settings', side: 'right'}}>
                        <Link href="/admin/settings">
                            <Settings />
                            <span>Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b">
          <SidebarTrigger />
          <h1 className="text-2xl font-headline">
            {menuItems.find((item) => item.href === pathname)?.label || "Dashboard"}
          </h1>
          <div>
            {/* User profile can go here */}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/20">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
