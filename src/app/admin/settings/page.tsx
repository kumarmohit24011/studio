
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
import { getHomepageSettings, updateHomepageSettings, uploadHeroImage } from "@/services/settingsService";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function SettingsPage() {
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImageFile(file);
      // Create a temporary URL to preview the image
      setHeroImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let finalHeroUrl = heroImageUrl;

      if (newImageFile) {
        try {
          const downloadURL = await uploadHeroImage(newImageFile);
          finalHeroUrl = downloadURL; // Use the URL from storage
          setHeroImageUrl(downloadURL); // Update preview with final URL
          setNewImageFile(null); // Clear the file after successful upload
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          toast({
            variant: "destructive",
            title: "Image Upload Failed",
            description: "Could not upload the new hero image. Please try again.",
          });
          // Revert to the old image URL if the upload fails
          const settings = await getHomepageSettings();
          if (settings) setHeroImageUrl(settings.heroImageUrl || "");
          setIsSaving(false);
          return;
        }
      }

      await updateHomepageSettings({ heroImageUrl: finalHeroUrl });

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
    } finally {
      setIsSaving(false);
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
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="hero-image">Hero Image</Label>
            <Input
              id="hero-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isSaving}
            />
          </div>
          {heroImageUrl && (
            <div>
              <Label>Current Hero Image</Label>
              <div className="mt-2 relative w-full h-64 rounded-md overflow-hidden border">
                <Image
                  src={heroImageUrl}
                  alt="Hero Image Preview"
                  fill
                  style={{objectFit: 'cover'}}
                  unoptimized={!!newImageFile} // Prevents Next.js from trying to optimize a local blob URL
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </CardFooter>
    </Card>
  );
}
