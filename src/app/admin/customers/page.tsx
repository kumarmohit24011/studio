
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminCustomersPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Manage Customers</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <p>A table of users will go here for management.</p>
        </CardContent>
      </Card>
    </div>
  );
}
