
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteContent, type SiteContent } from "@/services/siteContentService";
import { ShippingSettingsForm } from "./_components/shipping-settings-form";

export default async function AdminSettingsPage() {
  const siteContent: SiteContent = await getSiteContent();

  const plainShippingSettings = {
    ...siteContent.shippingSettings,
    updatedAt: siteContent.shippingSettings.updatedAt ? new Date(siteContent.shippingSettings.updatedAt.seconds * 1000).toISOString() : undefined,
  };


  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
            <p className="text-muted-foreground">Configure your website and admin preferences.</p>
        </div>
        
        <ShippingSettingsForm settings={plainShippingSettings} />

        {/* Other settings cards can be added here in the future */}
    </div>
  );
}
