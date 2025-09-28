"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  Printer,
  Package,
  Truck,
  Clock,
  DollarSign,
  Plus,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Settings,
  Upload,
} from "lucide-react";
import {
  FulfillmentService,
  ProviderProfile,
} from "@/services/fulfillment.service";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";

interface CompanyInfo {
  company_name: string;
  contact_email: string;
  contact_phone: string;
  business_license: string;
  tax_id: string;
  website_url: string;
  description: string;
  logo_url: string;
}

interface ProductCapability {
  template_id: string;
  product_name: string;
  materials: string[];
  sizes: string[];
  colors: string[];
  print_methods: string[];
  max_print_area: {
    width: number;
    height: number;
    unit: string;
  };
}

interface Pricing {
  base_prices: Record<string, number>;
  shipping_rates: {
    standard: number;
    expedited: number;
    rush: number;
  };
  rush_fee_percentage: number;
}

interface ServiceLevels {
  production_time_days: number;
  shipping_time_days: number;
  quality_guarantee: boolean;
  return_policy_days: number;
}

export function ProviderProfileSetup() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "company" | "capabilities" | "pricing" | "service"
  >("company");

  // Form states
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    company_name: "",
    contact_email: "",
    contact_phone: "",
    business_license: "",
    tax_id: "",
    website_url: "",
    description: "",
    logo_url: "",
  });

  const [capabilities, setCapabilities] = useState<ProductCapability[]>([]);
  const [newCapability, setNewCapability] = useState<ProductCapability>({
    template_id: "",
    product_name: "",
    materials: [],
    sizes: [],
    colors: [],
    print_methods: [],
    max_print_area: { width: 0, height: 0, unit: "mm" },
  });

  const [pricing, setPricing] = useState<Pricing>({
    base_prices: {},
    shipping_rates: {
      standard: 4.99,
      expedited: 9.99,
      rush: 19.99,
    },
    rush_fee_percentage: 25,
  });

  const [serviceLevels, setServiceLevels] = useState<ServiceLevels>({
    production_time_days: 3,
    shipping_time_days: 5,
    quality_guarantee: true,
    return_policy_days: 30,
  });

  const [regions, setRegions] = useState<string[]>([]);
  const [newRegion, setNewRegion] = useState("");
  const [productionCapacity, setProductionCapacity] = useState({
    daily_capacity: 100,
    rush_orders: true,
    bulk_discounts: true,
  });

  const fulfillmentService = FulfillmentService.getInstance();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await fulfillmentService.getProfile();

      if (profileData) {
        setProfile(profileData);
        setCompanyInfo(profileData.company_info);
        setCapabilities(profileData.capabilities.supported_products || []);
        setPricing(profileData.pricing);
        setServiceLevels(profileData.service_levels);
        setRegions(profileData.capabilities.regions || []);
        setProductionCapacity(
          profileData.capabilities.production_capacity || {
            daily_capacity: 100,
            rush_orders: true,
            bulk_discounts: true,
          }
        );
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      // Initialize with empty data for new providers
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);

      const profileData = {
        company_info: companyInfo,
        capabilities: {
          supported_products: capabilities,
          regions,
          production_capacity: productionCapacity,
        },
        pricing,
        service_levels: serviceLevels,
      };

      if (profile) {
        await fulfillmentService.updateProfile(profileData);
        toast.success("Profile updated successfully");
      } else {
        await fulfillmentService.registerProvider(profileData);
        toast.success("Provider profile created successfully");
      }

      await loadProfile();
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const addCapability = () => {
    if (newCapability.template_id && newCapability.product_name) {
      setCapabilities([...capabilities, { ...newCapability }]);
      setNewCapability({
        template_id: "",
        product_name: "",
        materials: [],
        sizes: [],
        colors: [],
        print_methods: [],
        max_print_area: { width: 0, height: 0, unit: "mm" },
      });
      toast.success("Capability added");
    }
  };

  const removeCapability = (index: number) => {
    setCapabilities(capabilities.filter((_, i) => i !== index));
    toast.success("Capability removed");
  };

  const addRegion = () => {
    if (newRegion && !regions.includes(newRegion)) {
      setRegions([...regions, newRegion]);
      setNewRegion("");
    }
  };

  const removeRegion = (region: string) => {
    setRegions(regions.filter((r) => r !== region));
  };

  const addArrayItem = (
    array: string[],
    setArray: (arr: string[]) => void,
    item: string
  ) => {
    if (item && !array.includes(item)) {
      setArray([...array, item]);
    }
  };

  const removeArrayItem = (
    array: string[],
    setArray: (arr: string[]) => void,
    item: string
  ) => {
    setArray(array.filter((i) => i !== item));
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Provider Profile Setup
          </h1>
          <p className="mt-2 text-gray-600">
            Configure your printing capabilities and business information
          </p>
        </div>
        <Button onClick={saveProfile} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>

      {/* Status Alert */}
      {profile && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Profile Status:{" "}
            <Badge
              variant={profile.status === "active" ? "secondary" : "outline"}
              className="ml-2 capitalize"
            >
              {profile.status}
            </Badge>
            {profile.status === "pending_verification" &&
              " - Your profile is under review."}
            {profile.status === "active" && " - You are receiving orders."}
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation Tabs */}
      <div className="flex w-fit space-x-1 rounded-lg bg-gray-100 p-1">
        <Button
          variant={activeTab === "company" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("company")}
        >
          <Building2 className="mr-2 h-4 w-4" />
          Company Info
        </Button>
        <Button
          variant={activeTab === "capabilities" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("capabilities")}
        >
          <Printer className="mr-2 h-4 w-4" />
          Capabilities
        </Button>
        <Button
          variant={activeTab === "pricing" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("pricing")}
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Pricing
        </Button>
        <Button
          variant={activeTab === "service" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("service")}
        >
          <Settings className="mr-2 h-4 w-4" />
          Service Levels
        </Button>
      </div>

      {/* Company Information Tab */}
      {activeTab === "company" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Basic information about your printing business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Company Name *</label>
                <Input
                  value={companyInfo.company_name}
                  onChange={(e) =>
                    setCompanyInfo({
                      ...companyInfo,
                      company_name: e.target.value,
                    })
                  }
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Contact Email *</label>
                <Input
                  type="email"
                  value={companyInfo.contact_email}
                  onChange={(e) =>
                    setCompanyInfo({
                      ...companyInfo,
                      contact_email: e.target.value,
                    })
                  }
                  placeholder="contact@company.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Contact Phone</label>
                <Input
                  value={companyInfo.contact_phone}
                  onChange={(e) =>
                    setCompanyInfo({
                      ...companyInfo,
                      contact_phone: e.target.value,
                    })
                  }
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Website URL</label>
                <Input
                  value={companyInfo.website_url}
                  onChange={(e) =>
                    setCompanyInfo({
                      ...companyInfo,
                      website_url: e.target.value,
                    })
                  }
                  placeholder="https://company.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={companyInfo.description}
                  onChange={(e) =>
                    setCompanyInfo({
                      ...companyInfo,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your printing services..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Legal & Compliance</CardTitle>
              <CardDescription>
                Business registration and compliance information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Business License</label>
                <Input
                  value={companyInfo.business_license}
                  onChange={(e) =>
                    setCompanyInfo({
                      ...companyInfo,
                      business_license: e.target.value,
                    })
                  }
                  placeholder="Business license number"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tax ID</label>
                <Input
                  value={companyInfo.tax_id}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, tax_id: e.target.value })
                  }
                  placeholder="Tax identification number"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Logo URL</label>
                <Input
                  value={companyInfo.logo_url}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, logo_url: e.target.value })
                  }
                  placeholder="https://company.com/logo.png"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Service Regions</label>
                <div className="mb-2 flex space-x-2">
                  <Select value={newRegion} onValueChange={setNewRegion}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="EU">European Union</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addRegion} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {regions.map((region) => (
                    <Badge
                      key={region}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {region}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeRegion(region)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Capabilities Tab */}
      {activeTab === "capabilities" && (
        <div className="space-y-6">
          {/* Production Capacity */}
          <Card>
            <CardHeader>
              <CardTitle>Production Capacity</CardTitle>
              <CardDescription>
                Configure your daily production limits and capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Daily Capacity</label>
                <Input
                  type="number"
                  value={productionCapacity.daily_capacity}
                  onChange={(e) =>
                    setProductionCapacity({
                      ...productionCapacity,
                      daily_capacity: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="100"
                />
                <p className="mt-1 text-xs text-gray-500">Orders per day</p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={productionCapacity.rush_orders}
                  onChange={(e) =>
                    setProductionCapacity({
                      ...productionCapacity,
                      rush_orders: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <label className="text-sm font-medium">
                  Accept Rush Orders
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={productionCapacity.bulk_discounts}
                  onChange={(e) =>
                    setProductionCapacity({
                      ...productionCapacity,
                      bulk_discounts: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <label className="text-sm font-medium">
                  Offer Bulk Discounts
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Add New Capability */}
          <Card>
            <CardHeader>
              <CardTitle>Add Product Capability</CardTitle>
              <CardDescription>
                Add a new product type that you can print
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Template ID</label>
                  <Input
                    value={newCapability.template_id}
                    onChange={(e) =>
                      setNewCapability({
                        ...newCapability,
                        template_id: e.target.value,
                      })
                    }
                    placeholder="t-shirt-basic"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Product Name</label>
                  <Input
                    value={newCapability.product_name}
                    onChange={(e) =>
                      setNewCapability({
                        ...newCapability,
                        product_name: e.target.value,
                      })
                    }
                    placeholder="Basic T-Shirt"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">
                    Max Print Width (mm)
                  </label>
                  <Input
                    type="number"
                    value={newCapability.max_print_area.width}
                    onChange={(e) =>
                      setNewCapability({
                        ...newCapability,
                        max_print_area: {
                          ...newCapability.max_print_area,
                          width: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    placeholder="280"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Max Print Height (mm)
                  </label>
                  <Input
                    type="number"
                    value={newCapability.max_print_area.height}
                    onChange={(e) =>
                      setNewCapability({
                        ...newCapability,
                        max_print_area: {
                          ...newCapability.max_print_area,
                          height: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    placeholder="350"
                  />
                </div>
              </div>

              <Button onClick={addCapability} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Capability
              </Button>
            </CardContent>
          </Card>

          {/* Current Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle>
                Current Capabilities ({capabilities.length})
              </CardTitle>
              <CardDescription>
                Products you can currently print
              </CardDescription>
            </CardHeader>
            <CardContent>
              {capabilities.length === 0 ? (
                <div className="py-8 text-center">
                  <Printer className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">No capabilities added yet</p>
                  <p className="mt-1 text-sm text-gray-400">
                    Add your first product capability above
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {capabilities.map((capability, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">
                            {capability.product_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Template: {capability.template_id}
                          </p>
                          <p className="text-sm text-gray-600">
                            Max Print Area: {capability.max_print_area.width} ×{" "}
                            {capability.max_print_area.height} mm
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeCapability(index)}
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pricing Tab */}
      {activeTab === "pricing" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Rates</CardTitle>
              <CardDescription>Configure your shipping pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Standard Shipping</label>
                <Input
                  type="number"
                  step="0.01"
                  value={pricing.shipping_rates.standard}
                  onChange={(e) =>
                    setPricing({
                      ...pricing,
                      shipping_rates: {
                        ...pricing.shipping_rates,
                        standard: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  placeholder="4.99"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Expedited Shipping
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={pricing.shipping_rates.expedited}
                  onChange={(e) =>
                    setPricing({
                      ...pricing,
                      shipping_rates: {
                        ...pricing.shipping_rates,
                        expedited: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  placeholder="9.99"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Rush Shipping</label>
                <Input
                  type="number"
                  step="0.01"
                  value={pricing.shipping_rates.rush}
                  onChange={(e) =>
                    setPricing({
                      ...pricing,
                      shipping_rates: {
                        ...pricing.shipping_rates,
                        rush: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  placeholder="19.99"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Rush Fee Percentage
                </label>
                <Input
                  type="number"
                  value={pricing.rush_fee_percentage}
                  onChange={(e) =>
                    setPricing({
                      ...pricing,
                      rush_fee_percentage: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="25"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Additional percentage for rush orders
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Base Prices</CardTitle>
              <CardDescription>
                Set base prices for your products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {capabilities.map((capability, index) => (
                  <div key={index}>
                    <label className="text-sm font-medium">
                      {capability.product_name}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={pricing.base_prices[capability.template_id] || ""}
                      onChange={(e) =>
                        setPricing({
                          ...pricing,
                          base_prices: {
                            ...pricing.base_prices,
                            [capability.template_id]:
                              parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      placeholder="12.99"
                    />
                  </div>
                ))}
                {capabilities.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Add product capabilities first to set base prices
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Service Levels Tab */}
      {activeTab === "service" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Production Timeline</CardTitle>
              <CardDescription>
                Configure your production and shipping times
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Production Time (Days)
                </label>
                <Input
                  type="number"
                  value={serviceLevels.production_time_days}
                  onChange={(e) =>
                    setServiceLevels({
                      ...serviceLevels,
                      production_time_days: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="3"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Days to complete production
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Shipping Time (Days)
                </label>
                <Input
                  type="number"
                  value={serviceLevels.shipping_time_days}
                  onChange={(e) =>
                    setServiceLevels({
                      ...serviceLevels,
                      shipping_time_days: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="5"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Days for shipping and delivery
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quality & Policies</CardTitle>
              <CardDescription>
                Configure your quality guarantees and policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={serviceLevels.quality_guarantee}
                  onChange={(e) =>
                    setServiceLevels({
                      ...serviceLevels,
                      quality_guarantee: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <label className="text-sm font-medium">Quality Guarantee</label>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Return Policy (Days)
                </label>
                <Input
                  type="number"
                  value={serviceLevels.return_policy_days}
                  onChange={(e) =>
                    setServiceLevels({
                      ...serviceLevels,
                      return_policy_days: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="30"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Days customers can return products
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
