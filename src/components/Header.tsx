
'use client';

import Link from "next/link";
import { Button } from "./ui/button";
import { Heart, Search, ShoppingCart, User, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import React from "react";

export function Header() {
  const { user, userProfile, authLoading, signOutUser } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const renderAuthComponent = () => {
    if (authLoading || !isClient) {
      return <Skeleton className="h-8 w-8 rounded-full" />;
    }

    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userProfile?.photoURL || user.photoURL || undefined} alt={userProfile?.displayName || user.displayName || 'User'} />
                <AvatarFallback>{userProfile?.displayName?.[0] || user.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
             {userProfile?.isAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Admin</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={signOutUser}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>
    );
  };
  
  const navLinks = (
    <>
      <Link href="/products" className="hover:text-primary transition-colors">All Products</Link>
      <Link href="/products?category=Rings" className="hover:text-primary transition-colors">Rings</Link>
      <Link href="/products?category=Necklaces" className="hovertext-primary transition-colors">Necklaces</Link>
      <Link href="/products?category=Bracelets" className="hover:text-primary transition-colors">Bracelets</Link>
      <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
    </>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-headline font-bold text-primary">
          Red Bow
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/search">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/wishlist" className="relative">
              <Heart className="h-5 w-5" />
              {isClient && wishlist.length > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{wishlist.length}</span>}
              <span className="sr-only">Wishlist</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {isClient && cartItemCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{cartItemCount}</span>}
              <span className="sr-only">Cart</span>
            </Link>
          </Button>
          <div className="hidden md:block">{renderAuthComponent()}</div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-sm">
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center p-4 border-b">
                        <Link href="/" className="text-xl font-headline font-bold text-primary" onClick={() => setMobileMenuOpen(false)}>
                            Red Bow
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                    <nav className="flex flex-col gap-4 p-4 text-lg">
                        {React.Children.map(navLinks.props.children, child => 
                            React.cloneElement(child, { onClick: () => setMobileMenuOpen(false) })
                        )}
                    </nav>
                    <div className="mt-auto p-4 border-t">
                      {renderAuthComponent()}
                    </div>
                </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
