
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">Contact Us</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">We're here to help. Reach out to us with any questions or feedback.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Contact Information */}
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Our Information</CardTitle>
                    <CardDescription>Find us or get in touch directly.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground">
                     <a href="mailto:support@redbow.com" className="flex items-start gap-4 hover:text-primary transition-colors">
                        <Mail className="h-6 w-6 mt-1 flex-shrink-0" /> 
                        <div>
                            <p className="font-semibold text-foreground">Email</p>
                            <p>support@redbow.com</p>
                            <p className="text-xs">We typically respond within 24 hours.</p>
                        </div>
                    </a>
                     <a href="tel:+919876543210" className="flex items-start gap-4 hover:text-primary transition-colors">
                        <Phone className="h-6 w-6 mt-1 flex-shrink-0" />
                         <div>
                            <p className="font-semibold text-foreground">Phone</p>
                            <p>+91 987 654 3210</p>
                             <p className="text-xs">Mon - Fri, 9am - 5pm IST</p>
                        </div>
                    </a>
                     <div className="flex items-start gap-4">
                        <MapPin className="h-6 w-6 mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-foreground">Our Office</p>
                            <p>123 Jewel Lane, Mumbai, MH 400001</p>
                             <p className="text-xs">Please note: Our office is not a retail location.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        
        {/* Contact Form */}
        <div>
           <Card>
                <CardHeader>
                    <CardTitle>Send us a Message</CardTitle>
                    <CardDescription>Fill out the form and we'll get back to you.</CardDescription>
                </CardHeader>
                <CardContent>
                     <form className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="Your name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="you@example.com" />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" placeholder="e.g. Question about an order" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" placeholder="Your message..." rows={5} />
                        </div>
                        <Button type="submit" className="w-full">Send Message</Button>
                    </form>
                </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
