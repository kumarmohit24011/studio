
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminCustomersPage() {
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
            <p>A table of users will go here for management.</p>
            </CardContent>
        </Card>
    </div>
  );
}
