
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Manage Orders</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p>A table or list of orders will go here for management.</p>
        </CardContent>
      </Card>
    </div>
  );
}
