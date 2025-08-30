
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Coupon } from "@/services/couponService";
import { useState, useEffect } from "react";
import { addCoupon, updateCoupon } from "@/services/couponService";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface CouponDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  coupon: Coupon | null;
}

const emptyCoupon: Omit<Coupon, 'id'> = {
  code: "",
  discountType: "percentage",
  discountValue: 0,
  expiryDate: new Date().getTime() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
  minPurchase: 0,
  isActive: true,
};

export function CouponDialog({ isOpen, onClose, onSave, coupon }: CouponDialogProps) {
  const [formData, setFormData] = useState<Omit<Coupon, 'id'>>(emptyCoupon);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(new Date(emptyCoupon.expiryDate));
  const { toast } = useToast();

  useEffect(() => {
    if (coupon) {
      setFormData(coupon);
      setExpiryDate(new Date(coupon.expiryDate));
    } else {
      setFormData(emptyCoupon);
      setExpiryDate(new Date(emptyCoupon.expiryDate));
    }
  }, [coupon, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (id: string, value: string) => {
     setFormData((prev) => ({ ...prev, [id]: value }));
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: Number(value) }));
  }
  
  const handleSwitchChange = (checked: boolean) => {
      setFormData(prev => ({...prev, isActive: checked}));
  }

  const handleDateChange = (date: Date | undefined) => {
      setExpiryDate(date);
      if (date) {
        setFormData(prev => ({...prev, expiryDate: date.getTime()}));
      }
  }

  const handleSubmit = async () => {
    if (!formData.code || formData.discountValue <= 0) {
        toast({ variant: "destructive", title: "Error", description: "Please fill out all required fields."});
        return;
    }

    const dataToSave = {
        ...formData,
        expiryDate: expiryDate ? expiryDate.getTime() : new Date().getTime(),
    }
    
    if (coupon) {
      await updateCoupon(coupon.id, dataToSave);
      toast({ title: "Success", description: "Coupon updated successfully." });
    } else {
      await addCoupon(dataToSave);
      toast({ title: "Success", description: "Coupon added successfully." });
    }
    onSave();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{coupon ? "Edit Coupon" : "Add New Coupon"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">Code</Label>
            <Input id="code" value={formData.code} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="discountType" className="text-right">Type</Label>
            <Select value={formData.discountType} onValueChange={(value) => handleSelectChange('discountType', value)}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="discountValue" className="text-right">Value</Label>
            <Input id="discountValue" type="number" value={formData.discountValue} onChange={handleNumberChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minPurchase" className="text-right">Min. Purchase</Label>
            <Input id="minPurchase" type="number" value={formData.minPurchase} onChange={handleNumberChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="expiryDate" className="text-right">Expiry Date</Label>
             <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !expiryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isActive" className="text-right">Active</Label>
            <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleSwitchChange}
            />
           </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
