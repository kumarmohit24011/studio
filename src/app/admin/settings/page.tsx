
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteContent, type SiteContent } from "@/services/siteContentService";
import { ShippingSettingsForm } from "./_components/shipping-settings-form";

export default async function AdminSettingsPage() {
  const siteContent: SiteContent = await getSiteContent();

  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
            <p className="text-muted-foreground">Configure your website and admin preferences.</p>
        </div>
        
        <ShippingSettingsForm settings={siteContent.shippingSettings} />

        {/* Other settings cards can be added here in the future */}
    </div>
  );
}
