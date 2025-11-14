import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

export interface Business {
  id: string;
  name: string;
  streetName: string;
  zipcode: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  tags: string[];
  comment: string;
  isActive: boolean;
}

interface EditBusinessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: Business | null;
  onSave: (business: Business) => void;
}

export function EditBusinessDialog({ open, onOpenChange, business, onSave }: EditBusinessDialogProps) {
  const [formData, setFormData] = useState<Business>({
    id: "",
    name: "",
    streetName: "",
    zipcode: "",
    city: "",
    country: "",
    email: "",
    phone: "",
    tags: [],
    comment: "",
    isActive: true,
  });
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (business) {
      setFormData(business);
    } else {
      setFormData({
        id: "",
        name: "",
        streetName: "",
        zipcode: "",
        city: "",
        country: "",
        email: "",
        phone: "",
        tags: [],
        comment: "",
        isActive: true,
      });
    }
    setErrors({});
  }, [business, open]);

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Business name is required";
    }
    if (!formData.streetName.trim()) {
      newErrors.streetName = "Street name is required";
    }
    if (!formData.zipcode.trim()) {
      newErrors.zipcode = "Zipcode is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" data-testid="dialog-edit-business">
        <DialogHeader>
          <DialogTitle>{business ? 'Edit Business' : 'Add Business'}</DialogTitle>
          <DialogDescription>
            {business ? 'Update the business information below.' : 'Add a new business to your database.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Company Inc."
                data-testid="input-name"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label htmlFor="streetName">Street Name *</Label>
              <Input
                id="streetName"
                value={formData.streetName}
                onChange={(e) => setFormData({ ...formData, streetName: e.target.value })}
                placeholder="123 Main St"
                data-testid="input-street"
                className={errors.streetName ? "border-destructive" : ""}
              />
              {errors.streetName && <p className="text-xs text-destructive">{errors.streetName}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zipcode">Zipcode *</Label>
              <Input
                id="zipcode"
                value={formData.zipcode}
                onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                placeholder="10001"
                data-testid="input-zipcode"
                className={errors.zipcode ? "border-destructive" : ""}
              />
              {errors.zipcode && <p className="text-xs text-destructive">{errors.zipcode}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="New York"
                data-testid="input-city"
                className={errors.city ? "border-destructive" : ""}
              />
              {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="United States"
                data-testid="input-country"
                className={errors.country ? "border-destructive" : ""}
              />
              {errors.country && <p className="text-xs text-destructive">{errors.country}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@company.com"
                data-testid="input-email"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                data-testid="input-phone"
              />
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add a tag..."
                  data-testid="input-tag-edit"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                  data-testid="button-add-tag-edit"
                >
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Add any extra information about this business..."
                className="resize-none"
                rows={3}
                data-testid="input-comment"
              />
            </div>
            
            <div className="col-span-2 flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
                data-testid="checkbox-active"
              />
              <Label
                htmlFor="isActive"
                className="text-sm font-normal cursor-pointer"
              >
                Active account
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-edit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.name.trim()}
            data-testid="button-save-edit"
          >
            {business ? 'Save Changes' : 'Add Business'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
