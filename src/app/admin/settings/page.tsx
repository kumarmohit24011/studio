
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getHomepageSettings, updateHomepageSettings } from "@/services/settingsService";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const settings = await getHomepageSettings();
      if (settings && settings.heroImageUrl) {
        setHeroImageUrl(settings.heroImageUrl);
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      await updateHomepageSettings({ heroImageUrl });
      toast({
        title: "Success",
        description: "Homepage settings updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update settings.",
      });
      console.error(error);
    }
  };
  
  if (loading) {
    return <div>Loading settings...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Homepage Settings</CardTitle>
        <CardDescription>Manage the content displayed on your homepage.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="hero-image-url">Hero Image URL</Label>
            <Input
              id="hero-image-url"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              placeholder="https://example.com/hero-image.png"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={handleSave}>Save</Button>
      </CardFooter>
    </Card>
  );
}
