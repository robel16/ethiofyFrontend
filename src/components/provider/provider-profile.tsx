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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loading } from "@/components/ui/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Settings,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  FulfillmentService,
  ProviderProfile,
  ProductCapability,
} from "@/services/fulfillment.service";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";

export function ProviderProfileManagement() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [capabilities, setCapabilities] = useState<ProductCapability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [newCapability, setNewCapability] = useState<
    Partial<ProductCapability>
  >({});
  const [showAddCapability, setShowAddCapability] = useState(false);

  const fulfillmentService = FulfillmentService.getInstance();

  useEffect(() => {
    if (user?.role === "print_provider") {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Mock data for demo
      const mockProfile: ProviderProfile = {
        id: "provider_123",
        company_info: {
          company_name: "Premium Print Co",
          contact_email: "contact@premiumprint.com",
          contact_phone: "+1234567890",
          business_license: "BL123456789",
          tax_id: "TAX123456789",
          website_url: "https://premiumprint.com",
          description:
            "High-quality printing services with fast turnaround times",
          logo_url: "https://premiumprint.com/logo.png",
        },
        status: "active",
        capabilities: {
          supported_products: [
            {
              template_id: "t-shirt-basic",
              product_name: "Basic T-Shirt",
              materials: ["cotton", "polyester", "blend"],
              sizes: ["XS", "S", "M", "L", "XL", "XXL"],
              colors: ["white", "black", "navy", "red"],
              print_methods: ["screen_print", "dtg"],
              max_print_area: {
                width: 280,
                height: 350,
                unit: "mm",
              },
            },
            {
              template_id: "hoodie-basic",
              product_name: "Basic Hoodie",
              materials: ["cotton", "polyester"],
              sizes: ["S", "M", "L", "XL", "XXL"],
              colors: ["white", "black", "gray"],
              print_methods: ["screen_print", "dtg"],
              max_print_area: {
                width: 300,
                height: 400,
                unit: "mm",
              },
            },
          ],
          regions: ["US", "CA"],
          production_capacity: {
            daily_capacity: 500,
            rush_orders: true,
            bulk_discounts: true,
          },
        },
        pricing: {
          base_prices: {
            "t-shirt-basic": 12.99,
            "hoodie-basic": 24.99,
          },
          shipping_rates: {
            standard: 4.99,
            expedited: 9.99,
            rush: 19.99,
          },
          rush_fee_percentage: 25,
        },
        service_levels: {
          production_time_days: 3,
          shipping_time_days: 5,
          quality_guarantee: true,
          return_policy_days: 30,
        },
      };

      setProfile(mockProfile);
      setCapabilities(mockProfile.capabilities.supported_products);
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;

    try {
      setSaving(true);

      // In real app, call API
      // await fulfillmentService.updateProviderProfile(profile);

      toast.success("Profile updated successfully");
      setEditingProfile(false);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const addCapability = async () => {
    if (!newCapability.template_id || !newCapability.product_name) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      // In real app, call API
      // await fulfillmentService.addCapability(newCapability as ProductCapability);

      const capability: ProductCapability = {
        template_id: newCapability.template_id!,
        product_name: newCapability.product_name!,
        materials: newCapability.materials || [],
        sizes: newCapability.sizes || [],
        colors: newCapability.colors || [],
        print_methods: newCapability.print_methods || [],
        max_print_area: newCapability.max_print_area || {
          width: 0,
          height: 0,
          unit: "mm",
        },
      };

      setCapabilities([...capabilities, capability]);
      setNewCapability({});
      setShowAddCapability(false);
      toast.success("Capability added successfully");
    } catch (error: any) {
      console.error("Error adding capability:", error);
      toast.error("Failed to add capability");
    }
  };

  const removeCapability = async (templateId: string) => {
    try {
      // In real app, call API
      // await fulfillmentService.removeCapability(templateId);

      setCapabilities(
        capabilities.filter((cap) => cap.template_id !== templateId)
      );
      toast.success("Capability removed successfully");
    } catch (error: any) {
      console.error("Error removing capability:", error);
      toast.error("Failed to remove capability");
    }
  };

  const updateStatus = async (newStatus: string, reason?: string) => {
    try {
      // In real app, call API
      // await fulfillmentService.updateProviderStatus(newStatus, reason);

      if (profile) {
        setProfile({ ...profile, status: newStatus as any });
      }
      toast.success(`Status updated to ${newStatus}`);
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <Loading />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load provider profile. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Provider Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your company information and capabilities
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge
            variant={profile.status === "active" ? "secondary" : "destructive"}
            className="capitalize"
          >
            {profile.status}
          </Badge>
          <Button
            onClick={() => setEditingProfile(!editingProfile)}
            variant={editingProfile ? "outline" : "default"}
          >
            {editingProfile ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Company Information
          </CardTitle>
          <CardDescription>
            Basic information about your printing business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={profile.company_info.company_name}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    company_info: {
                      ...profile.company_info,
                      company_name: e.target.value,
                    },
                  })
                }
                disabled={!editingProfile}
              />
            </div>
            <div>
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={profile.company_info.contact_email}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    company_info: {
                      ...profile.company_info,
                      contact_email: e.target.value,
                    },
                  })
                }
                disabled={!editingProfile}
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                value={profile.company_info.contact_phone || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    company_info: {
                      ...profile.company_info,
                      contact_phone: e.target.value,
                    },
                  })
                }
                disabled={!editingProfile}
              />
            </div>
            <div>
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                value={profile.company_info.website_url || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    company_info: {
                      ...profile.company_info,
                      website_url: e.target.value,
                    },
                  })
                }
                disabled={!editingProfile}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={profile.company_info.description || ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  company_info: {
                    ...profile.company_info,
                    description: e.target.value,
                  },
                })
              }
              disabled={!editingProfile}
              rows={3}
            />
          </div>

          {editingProfile && (
            <div className="flex justify-end space-x-2">
              <Button onClick={saveProfile} disabled={saving}>
                {saving ? (
                  <>
                    <Loading />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Service Levels
          </CardTitle>
          <CardDescription>
            Your production and service capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>Production Time</Label>
              <p className="text-2xl font-bold text-blue-600">
                {profile.service_levels.production_time_days} days
              </p>
            </div>
            <div>
              <Label>Shipping Time</Label>
              <p className="text-2xl font-bold text-green-600">
                {profile.service_levels.shipping_time_days} days
              </p>
            </div>
            <div>
              <Label>Daily Capacity</Label>
              <p className="text-2xl font-bold text-purple-600">
                {profile.capabilities.production_capacity.daily_capacity} items
              </p>
            </div>
            <div>
              <Label>Return Policy</Label>
              <p className="text-2xl font-bold text-orange-600">
                {profile.service_levels.return_policy_days} days
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {profile.service_levels.quality_guarantee && (
              <Badge variant="secondary">
                <CheckCircle className="mr-1 h-3 w-3" />
                Quality Guarantee
              </Badge>
            )}
            {profile.capabilities.production_capacity.rush_orders && (
              <Badge variant="secondary">
                <CheckCircle className="mr-1 h-3 w-3" />
                Rush Orders
              </Badge>
            )}
            {profile.capabilities.production_capacity.bulk_discounts && (
              <Badge variant="secondary">
                <CheckCircle className="mr-1 h-3 w-3" />
                Bulk Discounts
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Capabilities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Product Capabilities</CardTitle>
            <CardDescription>
              Products and services you can provide
            </CardDescription>
          </div>
          <Dialog open={showAddCapability} onOpenChange={setShowAddCapability}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Capability
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product Capability</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template_id">Template ID</Label>
                  <Input
                    id="template_id"
                    value={newCapability.template_id || ""}
                    onChange={(e) =>
                      setNewCapability({
                        ...newCapability,
                        template_id: e.target.value,
                      })
                    }
                    placeholder="e.g., mug-ceramic"
                  />
                </div>
                <div>
                  <Label htmlFor="product_name">Product Name</Label>
                  <Input
                    id="product_name"
                    value={newCapability.product_name || ""}
                    onChange={(e) =>
                      setNewCapability({
                        ...newCapability,
                        product_name: e.target.value,
                      })
                    }
                    placeholder="e.g., Ceramic Mug"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddCapability(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={addCapability}>Add Capability</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {capabilities.map((capability) => (
              <div
                key={capability.template_id}
                className="rounded-lg border p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">{capability.product_name}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeCapability(capability.template_id)}
                    className="border-red-600 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <Label className="text-xs font-medium text-gray-500">
                      Materials
                    </Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {capability.materials.map((material) => (
                        <Badge
                          key={material}
                          variant="outline"
                          className="text-xs"
                        >
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-500">
                      Sizes
                    </Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {capability.sizes.map((size) => (
                        <Badge key={size} variant="outline" className="text-xs">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-500">
                      Colors
                    </Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {capability.colors.map((color) => (
                        <Badge
                          key={color}
                          variant="outline"
                          className="text-xs"
                        >
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-500">
                      Print Methods
                    </Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {capability.print_methods.map((method) => (
                        <Badge
                          key={method}
                          variant="outline"
                          className="text-xs"
                        >
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  Max Print Area: {capability.max_print_area.width} ×{" "}
                  {capability.max_print_area.height}{" "}
                  {capability.max_print_area.unit}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Management */}
      <Card>
        <CardHeader>
          <CardTitle>Status Management</CardTitle>
          <CardDescription>
            Control your availability for new orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Current Status:</span>
              <Badge
                variant={
                  profile.status === "active" ? "secondary" : "destructive"
                }
                className="capitalize"
              >
                {profile.status}
              </Badge>
            </div>

            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => updateStatus("active")}
                disabled={profile.status === "active"}
                className="bg-green-600 hover:bg-green-700"
              >
                Set Active
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  updateStatus("maintenance", "Scheduled maintenance")
                }
                disabled={profile.status === "maintenance"}
              >
                Maintenance Mode
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus("inactive", "Temporarily inactive")}
                disabled={profile.status === "inactive"}
              >
                Set Inactive
              </Button>
            </div>
          </div>

          {profile.status !== "active" && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your status is currently "{profile.status}". You will not
                receive new orders until you set your status to active.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
