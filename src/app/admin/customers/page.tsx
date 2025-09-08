
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllCustomers } from "@/services/userService";
import { CustomerList } from "./_components/customer-list";
import type { UserProfile } from "@/lib/types";

export default async function AdminCustomersPage() {
    const customers: UserProfile[] = await getAllCustomers();

  return (
     <div className="flex flex-col gap-4">
       <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Customers</h1>
       </div>
        <Card>
            <CardHeader>
            <CardTitle>Manage Customers</CardTitle>
             <CardDescription>
                View and manage your customer list.
            </CardDescription>
            </CardHeader>
            <CardContent>
                <CustomerList customers={customers} />
            </CardContent>
        </Card>
    </div>
  );
}
