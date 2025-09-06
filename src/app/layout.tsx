
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Script from "next/script";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Redbow - Exquisite Jewelry",
  description: "Discover timeless elegance with Redbow's curated collection of fine jewelry. High-quality pieces for every occasion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased"
        )}
      >
        <Providers>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
        </Providers>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </body>
    </html>
  );
}
