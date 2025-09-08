
import { Suspense } from 'react';
import { AccountPageContent } from './_components/account-page-content';
import { Skeleton } from '@/components/ui/skeleton';

function AccountPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-5 w-64" />
                </div>
            </div>
            <Skeleton className="h-10 w-full max-w-lg mb-6" />
            <div className="grid md:grid-cols-3 gap-8 mt-6">
                <div className="md:col-span-2">
                    <Skeleton className="h-96 w-full" />
                </div>
                <div>
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
      </div>
    )
}


export default function AccountPage() {
  return (
    <Suspense fallback={<AccountPageSkeleton />}>
        <AccountPageContent />
    </Suspense>
  );
}
