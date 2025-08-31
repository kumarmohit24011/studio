
"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Heart,
  Search,
  ShoppingCart,
  UserCircle,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "./ui/badge";
import { useWishlist } from "@/hooks/use-wishlist";
import { Skeleton } from "./ui/skeleton";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const { user, userProfile, signOut, loading: authLoading, profileLoading } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-8 w-8 text-primary"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.41 7.41L12 12.83l-3.41-3.42-1.42 1.42L12 15.67l4.83-4.84-1.42-1.42z" />
          </svg>
          <span className="font-bold font-headline text-2xl">Redbow</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-primary">Home</Link>
          <Link href="/products" className="transition-colors hover:text-primary">Products</Link>
          <Link href="/#offers" className="transition-colors hover:text-primary">Offers</Link>
          <Link href="/#trending" className="transition-colors hover:text-primary">Trending</Link>
          {profileLoading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            userProfile?.isAdmin && (
              <Link href="/admin" className="transition-colors hover:text-primary">Admin</Link>
            )
          )}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden lg:flex flex-1 max-w-xs relative">
            <Input 
              type="search" 
              placeholder="Search for jewelry..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile?tab=wishlist" className="relative">
              <Heart className="h-5 w-5" />
               {wishlistCount > 0 && (
                <Badge className="absolute -right-2 -top-2 h-5 w-5 justify-center p-0" variant="destructive">{wishlistCount}</Badge>
              )}
               <span className="sr-only">Wishlist</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -right-2 -top-2 h-5 w-5 justify-center p-0" variant="destructive">{cartCount}</Badge>
              )}
              <span className="sr-only">Cart</span>
            </Link>
          </Button>

          {authLoading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  {user ? (
                      <Avatar className="h-8 w-8">
                          <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'}/>
                          <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                      </Avatar>
                  ) : (
                      <UserCircle className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user ? (
                  <>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/profile"><UserCircle className="mr-2"/>Profile</Link></DropdownMenuItem>
                    {!profileLoading && userProfile?.isAdmin && (
                        <DropdownMenuItem asChild><Link href="/admin"><LayoutDashboard className="mr-2"/>Admin</Link></DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}><LogOut className="mr-2"/>Logout</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Guest</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/login">Login</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/signup">Sign Up</Link></DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
