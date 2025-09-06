
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
        </div>
        <Card>
            <CardHeader>
            <CardTitle>Admin Settings</CardTitle>
            <CardDescription>
                Configure your website and admin preferences.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <p>Settings forms and options will go here.</p>
            </CardContent>
        </Card>
    </div>
  );
}
