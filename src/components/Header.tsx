import Link from "next/link";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Heart,
  Search,
  ShoppingCart,
  UserCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
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
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden lg:flex flex-1 max-w-xs relative">
            <Input type="search" placeholder="Search for jewelry..." className="pl-10" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile?tab=wishlist"><Heart className="h-5 w-5" /></Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart"><ShoppingCart className="h-5 w-5" /></Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/profile?tab=orders">Orders</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/login">Login</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/signup">Sign Up</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
