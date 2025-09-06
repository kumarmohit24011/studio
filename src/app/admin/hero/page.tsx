
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getHeroSection } from "@/services/siteContentService";
import { HeroForm } from "./_components/hero-form";


export default async function AdminHeroPage() {
  const heroData = await getHeroSection();

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
            <HeroForm heroData={heroData} />
        </CardContent>
      </Card>
    </div>
  );
}
