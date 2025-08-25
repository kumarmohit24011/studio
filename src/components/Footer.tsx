import Link from "next/link";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Youtube, Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary/30 text-secondary-foreground border-t border-border/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-headline text-lg mb-4">Redbow</h3>
            <p className="text-muted-foreground">
              Crafting memories with every piece of jewelry. Timeless elegance for modern life.
            </p>
          </div>
          <div>
            <h3 className="font-headline text-lg mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="hover:text-primary transition-colors">All Collections</Link></li>
              <li><Link href="/products?category=Rings" className="hover:text-primary transition-colors">Rings</Link></li>
              <li><Link href="/products?category=Necklaces" className="hover:text-primary transition-colors">Necklaces</Link></li>
              <li><Link href="/products?tag=sale" className="hover:text-primary transition-colors">Sale</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-lg mb-4">Stay Connected</h3>
            <p className="text-muted-foreground mb-4">
              Join our newsletter for exclusive offers and new arrivals.
            </p>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input type="email" placeholder="Email" />
              <Button type="submit">Subscribe</Button>
            </div>
            <div className="flex space-x-4 mt-6">
                <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary"><Youtube /></Link>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/50 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Redbow. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
