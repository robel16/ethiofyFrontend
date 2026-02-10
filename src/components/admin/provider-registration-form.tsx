"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { providerService } from "@/services/provider.service";

interface ProviderRegistrationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ProviderRegistrationForm({
  open,
  onOpenChange,
  onSuccess,
}: ProviderRegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Account Info
    password: "",
    confirm_password: "",

    // Company Info
    company_name: "",
    contact_email: "",
    contact_phone: "",
    business_license_number: "",
    tax_id: "",
    website_url: "",
    description: "",
    established_year: "",
    employee_count: "",

    // Address
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",

    // Capabilities
    regions: [] as string[],
    daily_capacity: "",
    rush_orders: true,
    bulk_discounts: true,

    // Service Levels
    production_time_days: "",
    shipping_time_days: "",
    quality_guarantee: true,
    return_policy_days: "",

    // Pricing
    base_price_tshirt: "",
    base_price_hoodie: "",
    shipping_rate_us: "",
    rush_fee_percentage: "",
  });

  const handleInputChange = (
    field: string,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRegionToggle = (region: string) => {
    setFormData((prev) => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter((r) => r !== region)
        : [...prev.regions, region],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Prepare the registration data according to the API spec
      const registrationData = {
        // Auth fields
        email: formData.contact_email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        role: "print_provider" as const,
        first_name: formData.company_name.split(" ")[0] || "Provider",
        last_name: "Account",
        terms_accepted: true,

        // Provider-specific data
        company_info: {
          company_name: formData.company_name,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          business_license_number: formData.business_license_number,
          tax_id: formData.tax_id,
          website_url: formData.website_url,
          description: formData.description,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postal_code,
            country: formData.country,
          },
          established_year: parseInt(formData.established_year) || undefined,
          employee_count: parseInt(formData.employee_count) || undefined,
        },
        capabilities: {
          supported_products: [
            {
              template_id: "tshirt_basic",
              product_name: "Basic T-Shirt",
              materials: ["100% Cotton", "Cotton Blend"],
              sizes: ["S", "M", "L", "XL", "XXL"],
              colors: ["Black", "White", "Navy", "Gray"],
              print_methods: ["Screen Print", "DTG", "Heat Transfer"],
              max_print_area: {
                width: 300,
                height: 400,
                unit: "mm",
              },
            },
          ],
          regions: formData.regions,
          production_capacity: {
            daily_capacity: parseInt(formData.daily_capacity) || 100,
            rush_orders: formData.rush_orders,
            bulk_discounts: formData.bulk_discounts,
          },
        },
        pricing: {
          base_prices: {
            tshirt_basic: parseFloat(formData.base_price_tshirt) || 12.5,
            hoodie_basic: parseFloat(formData.base_price_hoodie) || 25.0,
          },
          shipping_rates: {
            "US-West": parseFloat(formData.shipping_rate_us) || 5.99,
          },
          rush_fee_percentage: parseInt(formData.rush_fee_percentage) || 25,
        },
        service_levels: {
          production_time_days: parseInt(formData.production_time_days) || 3,
          shipping_time_days: parseInt(formData.shipping_time_days) || 5,
          quality_guarantee: formData.quality_guarantee,
          return_policy_days: parseInt(formData.return_policy_days) || 30,
        },
      };

      await providerService.registerProvider(registrationData);
      toast.success("Provider registered successfully!");
      onSuccess();
      onOpenChange(false);

      // Reset form
      setFormData({
        password: "",
        confirm_password: "",
        company_name: "",
        contact_email: "",
        contact_phone: "",
        business_license_number: "",
        tax_id: "",
        website_url: "",
        description: "",
        established_year: "",
        employee_count: "",
        street: "",
        city: "",
        state: "",
        postal_code: "",
        country: "US",
        regions: [],
        daily_capacity: "",
        rush_orders: true,
        bulk_discounts: true,
        production_time_days: "",
        shipping_time_days: "",
        quality_guarantee: true,
        return_policy_days: "",
        base_price_tshirt: "",
        base_price_hoodie: "",
        shipping_rate_us: "",
        rush_fee_percentage: "",
      });
    } catch (error) {
      toast.error("Failed to register provider");
      console.error("Provider registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Provider</DialogTitle>
          <DialogDescription>
            Add a new print provider to the platform
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Contact Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) =>
                      handleInputChange("contact_email", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) =>
                      handleInputChange("company_name", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <Label htmlFor="confirm_password">Confirm Password *</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={formData.confirm_password}
                    onChange={(e) =>
                      handleInputChange("confirm_password", e.target.value)
                    }
                    required
                    minLength={8}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) =>
                      handleInputChange("contact_phone", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) =>
                      handleInputChange("website_url", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_license_number">
                    Business License Number
                  </Label>
                  <Input
                    id="business_license_number"
                    value={formData.business_license_number}
                    onChange={(e) =>
                      handleInputChange(
                        "business_license_number",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="tax_id">Tax ID</Label>
                  <Input
                    id="tax_id"
                    value={formData.tax_id}
                    onChange={(e) =>
                      handleInputChange("tax_id", e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="established_year">Established Year</Label>
                  <Input
                    id="established_year"
                    type="number"
                    value={formData.established_year}
                    onChange={(e) =>
                      handleInputChange("established_year", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="employee_count">Employee Count</Label>
                  <Input
                    id="employee_count"
                    type="number"
                    value={formData.employee_count}
                    onChange={(e) =>
                      handleInputChange("employee_count", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => handleInputChange("street", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postal_code">Postal Code *</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) =>
                      handleInputChange("postal_code", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => handleInputChange("country", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Service Regions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Service Regions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {[
                  "US-West",
                  "US-Central",
                  "US-East",
                  "CA-West",
                  "CA-East",
                  "EU-West",
                ].map((region) => (
                  <label key={region} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.regions.includes(region)}
                      onChange={() => handleRegionToggle(region)}
                      className="rounded"
                    />
                    <span className="text-sm">{region}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register Provider"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
