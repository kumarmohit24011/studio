
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Admin Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Website Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Settings forms and options will go here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
