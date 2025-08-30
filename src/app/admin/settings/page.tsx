
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
import { getHomepageSettings, updateHomepageSettings, uploadHomepageImage } from "@/services/settingsService";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [offerImageUrl1, setOfferImageUrl1] = useState("");
  const [offerImageUrl2, setOfferImageUrl2] = useState("");

  const [newHeroImageFile, setNewHeroImageFile] = useState<File | null>(null);
  const [newOfferImage1File, setNewOfferImage1File] = useState<File | null>(null);
  const [newOfferImage2File, setNewOfferImage2File] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const settings = await getHomepageSettings();
      if (settings) {
        setHeroImageUrl(settings.heroImageUrl || "");
        setOfferImageUrl1(settings.offerImageUrl1 || "");
        setOfferImageUrl2(settings.offerImageUrl2 || "");
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setImageFile: React.Dispatch<React.SetStateAction<File | null>>, setImageUrl: React.Dispatch<React.SetStateAction<string>>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let settingsToUpdate: Partial<{heroImageUrl: string, offerImageUrl1: string, offerImageUrl2: string}> = {};

      if (newHeroImageFile) {
        const downloadURL = await uploadHomepageImage(newHeroImageFile, "hero-images");
        settingsToUpdate.heroImageUrl = downloadURL;
        setHeroImageUrl(downloadURL);
        setNewHeroImageFile(null);
      }

      if (newOfferImage1File) {
        const downloadURL = await uploadHomepageImage(newOfferImage1File, "offer-images");
        settingsToUpdate.offerImageUrl1 = downloadURL;
        setOfferImageUrl1(downloadURL);
        setNewOfferImage1File(null);
      }
      
      if (newOfferImage2File) {
        const downloadURL = await uploadHomepageImage(newOfferImage2File, "offer-images");
        settingsToUpdate.offerImageUrl2 = downloadURL;
        setOfferImageUrl2(downloadURL);
        setNewOfferImage2File(null);
      }

      if (Object.keys(settingsToUpdate).length > 0) {
        await updateHomepageSettings(settingsToUpdate);
      }

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
      console.error("An error occurred during the save process:", error);
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
      <CardContent className="grid gap-6">
        {/* Hero Image Section */}
        <div className="grid gap-3">
          <Label htmlFor="hero-image" className="text-lg font-medium">Hero Image</Label>
          <Input
            id="hero-image"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setNewHeroImageFile, setHeroImageUrl)}
            disabled={isSaving}
          />
          {heroImageUrl && (
            <div className="mt-2 relative w-full h-64 rounded-md overflow-hidden border">
              <Image
                src={heroImageUrl}
                alt="Hero Image Preview"
                fill
                style={{objectFit: 'cover'}}
                unoptimized={!!newHeroImageFile}
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Special Offer 1 Image Section */}
        <div className="grid gap-3">
            <Label htmlFor="offer-image-1" className="text-lg font-medium">Special Offer Image 1 (Left)</Label>
            <Input
                id="offer-image-1"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setNewOfferImage1File, setOfferImageUrl1)}
                disabled={isSaving}
            />
            {offerImageUrl1 && (
                <div className="mt-2 relative w-full h-56 rounded-md overflow-hidden border">
                <Image
                    src={offerImageUrl1}
                    alt="Offer Image 1 Preview"
                    fill
                    style={{objectFit: 'cover'}}
                    unoptimized={!!newOfferImage1File}
                />
                </div>
            )}
        </div>

        <Separator />

         {/* Special Offer 2 Image Section */}
        <div className="grid gap-3">
            <Label htmlFor="offer-image-2" className="text-lg font-medium">Special Offer Image 2 (Right)</Label>
            <Input
                id="offer-image-2"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setNewOfferImage2File, setOfferImageUrl2)}
                disabled={isSaving}
            />
            {offerImageUrl2 && (
                <div className="mt-2 relative w-full h-56 rounded-md overflow-hidden border">
                <Image
                    src={offerImageUrl2}
                    alt="Offer Image 2 Preview"
                    fill
                    style={{objectFit: 'cover'}}
                    unoptimized={!!newOfferImage2File}
                />
                </div>
            )}
        </div>

      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save All Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
