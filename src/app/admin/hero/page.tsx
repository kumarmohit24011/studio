
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteContent } from "@/services/server/siteContentQueries";
import { HeroForm } from "./_components/hero-form";

// Disable static generation to avoid prerendering Firebase data during build
export const dynamic = 'force-dynamic';

export default async function AdminHeroPage() {
  const siteContent = await getSiteContent();

  const plainHeroData = {
    ...siteContent.heroSection,
    updatedAt: siteContent.heroSection.updatedAt,
  };


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Hero Section</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Homepage Hero</CardTitle>
          <CardDescription>
            Update the content and background image of your homepage's hero section.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <HeroForm heroData={plainHeroData} />
        </CardContent>
      </Card>
    </div>
  );
}
