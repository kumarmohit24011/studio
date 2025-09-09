
'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function WishlistPage() {
  const router = useRouter();
  const { authLoading, user } = useAuth();
  
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        router.replace('/account');
      } else {
        router.replace('/login?redirect=/account');
      }
    }
  }, [router, authLoading, user]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center h-64">
        <h1 className="text-2xl font-bold mb-4">Redirecting to your account...</h1>
        <div className="w-full max-w-md space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
        </div>
      </div>
    </div>
  );
}
