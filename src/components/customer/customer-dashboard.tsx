"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Bell,
  Package,
  ShoppingBag,
  CreditCard,
  BarChart3,
  Settings,
  Palette,
  Crown,
  HelpCircle,
  BookOpen,
  User,
  ChevronRight,
  X,
  TrendingUp,
  Menu,
} from "lucide-react";
import { ProductCarousel } from "@/components/product-carousel";
import { SetupProgress } from "@/components/setup-progress";
import AccountSettings from "@/components/customer/account-settings";
import { NavUser } from "@/components/ui/nav-user";
import { useAuth } from "@/contexts/auth-context";
import { UserProfile, userService } from "@/services/user.service";
import { useEffect } from "react";

const sidebarItems = [
  { icon: Home, label: "Dashboard", active: true },
  { icon: Bell, label: "Notifications", hasSubmenu: true },
  { icon: Package, label: "Catalog", hasSubmenu: true },
  { icon: ShoppingBag, label: "My products" },
  { icon: Package, label: "Orders" },
  { icon: CreditCard, label: "Wallet", hasSubmenu: true },
  { icon: BarChart3, label: "Insights" },
  { icon: Settings, label: "Store settings" },
  { icon: Palette, label: "Branding" },
  { icon: Crown, label: "Printify Premium" },
  { icon: HelpCircle, label: "Need help?", hasSubmenu: true },
  { icon: BookOpen, label: "Resources", hasSubmenu: true },
  { icon: User, label: "Account", hasSubmenu: true },
];

const bestSellers = [
  {
    id: 1,
    name: "Unisex Softstyle T-Shirt",
    brand: "Gildan",
    sku: "64000",
    price: 7.79,
    premiumPrice: 5.74,
    image: "/white-tshirt-transparent.jpg",
    rating: 4.8,
    orders: 15420,
  },
  {
    id: 2,
    name: "Unisex Heavy Blend Crewneck",
    brand: "Gildan",
    sku: "18000",
    price: 15.24,
    premiumPrice: 11.22,
    image: "/black-hoodie-transparent.jpg",
    rating: 4.9,
    orders: 12350,
  },
  {
    id: 3,
    name: "Unisex Heavy Blend Hoodie",
    brand: "Gildan",
    sku: "18500",
    price: 21.58,
    premiumPrice: 16.65,
    image: "/black-hoodie-transparent.jpg",
    rating: 4.7,
    orders: 9870,
  },
  {
    id: 4,
    name: "Unisex Heavy Cotton Tee",
    brand: "Gildan",
    sku: "5000",
    price: 8.39,
    premiumPrice: 5.65,
    image: "/white-tshirt-transparent.jpg",
    rating: 4.6,
    orders: 8920,
  },
];

const trendingProducts = [
  {
    id: 5,
    name: "Premium Coffee Mug",
    brand: "Custom",
    price: 12.99,
    image: "/coffee-mug-transparent.jpg",
    trend: "+45%",
  },
  {
    id: 6,
    name: "Phone Case Collection",
    brand: "Universal",
    price: 18.5,
    image: "/phone-case-transparent.jpg",
    trend: "+32%",
  },
  {
    id: 7,
    name: "Eco Tote Bag",
    brand: "Sustainable",
    price: 14.75,
    image: "/tote-bag-transparent.jpg",
    trend: "+28%",
  },
];

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [showPromo, setShowPromo] = useState(true);
  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  console.log("user in customer", user);
  // Load complete user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const response = await userService.getProfile();
          const profile = response.user;

          console.log("Dashboard: Loaded user profile:", profile);
          setUserProfile(profile);
        } catch (error) {
          console.error("Dashboard: Failed to load user profile:", error);
        }
      }
    };

    loadUserProfile();
  }, [user]);

  console.log("user in customer", user);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Promotional Banner */}
      {showPromo && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-sm text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-2">
              <span>
                Get up to 20% discount on all products with Ethiofy Premium.
              </span>
              <Button
                variant="link"
                className="h-auto p-0 font-semibold text-white underline"
              >
                Get it now
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPromo(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sticky Sidebar */}
        <div
          className={`sticky top-0 h-screen ${sidebarOpen ? "w-64" : "w-16"} flex flex-col overflow-y-auto border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-800`}
        >
          {/* Logo */}
          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <span className="text-sm font-bold text-white">E</span>
              </div>
              {sidebarOpen && (
                <span className="text-xl font-bold dark:text-white">
                  Ethiofy
                </span>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="ml-auto rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-4 w-4 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Store Selector */}
          {sidebarOpen && (
            <div className="border-b border-gray-200 p-4 dark:border-gray-700">
              <Button
                variant="ghost"
                className="w-full justify-between text-left dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-600"></div>
                  <span className="text-sm">My new store</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-2">
            {sidebarItems.map((item, index) => (
              <Button
                key={index}
                variant={
                  (item.active && currentView === "dashboard") ||
                  (item.label === "Account" && currentView === "account")
                    ? "secondary"
                    : "ghost"
                }
                className={`mb-1 w-full ${sidebarOpen ? "justify-between" : "justify-center"} ${
                  (item.active && currentView === "dashboard") ||
                  (item.label === "Account" && currentView === "account")
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
                onClick={() => {
                  if (item.label === "Account") {
                    setCurrentView("account");
                  } else if (item.label === "Dashboard") {
                    setCurrentView("dashboard");
                  }
                }}
                title={!sidebarOpen ? item.label : undefined}
              >
                <div
                  className={`flex items-center ${sidebarOpen ? "gap-3" : ""}`}
                >
                  <item.icon className="h-4 w-4" />
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                </div>
                {item.hasSubmenu && sidebarOpen && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ))}
          </nav>

          {/* User Navigation at Bottom */}
          {user && (
            <div className="border-t border-gray-200 dark:border-gray-700 ">
              <NavUser
                user={{
                  id: user.id,
                  email: user.email,
                  first_name: userProfile?.profile.first_name,
                  last_name: userProfile?.profile.last_name,
                  avatar_url: userProfile?.profile.avatar_url,
                  role: user.role,
                }}
                sidebarOpen={sidebarOpen}
                onAccountClick={() => setCurrentView("account")}
                onNotificationsClick={() => {
                  // Navigate to notifications page
                  console.log("Navigate to notifications");
                }}
                onBillingClick={() => {
                  // Navigate to billing page
                  console.log("Navigate to billing");
                }}
              />
            </div>
          )}
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="space-y-6 p-6">
            {currentView === "account" ? (
              <AccountSettings onBack={() => setCurrentView("dashboard")} />
            ) : (
              <>
                {/* Setup Progress */}
                <SetupProgress />

                {/* Quick Actions Section */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Quick Actions
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                        <Palette className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                        Create New Product
                      </h3>
                      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Design and customize your products
                      </p>
                      <Button asChild className="w-full">
                        <a href="/editor">Start Designing</a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                        <ShoppingBag className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                        View Orders
                      </h3>
                      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Track your recent orders
                      </p>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        View All Orders
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                        Analytics
                      </h3>
                      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        View your store performance
                      </p>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        View Insights
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Best Sellers Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Create more for Clothing & Apparel
                    </h2>
                    <Button
                      variant="outline"
                      className="bg-transparent text-sm dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Change collection
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>

                  <ProductCarousel products={bestSellers} />
                </div>

                {/* Trending Products Banner */}
                <Card className="border-0 bg-gradient-to-r from-orange-400 to-orange-500 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Badge className="border-0 bg-white/20 text-white">
                          New
                        </Badge>
                        <h3 className="text-2xl font-bold">
                          First to market, first to profit.
                        </h3>
                        <p className="text-orange-100">
                          Stay ahead of the curve. Launch the hottest trending
                          products instantly, while shopper demand is at its
                          peak.
                        </p>
                        <Button className="mt-4 bg-gray-800 text-white hover:bg-gray-900">
                          See what&apos;s trending
                        </Button>
                      </div>
                      <div className="hidden md:block">
                        <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-white/10">
                          <TrendingUp className="h-16 w-16 text-white/80" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Trending Products Carousel */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Trending Now
                    </h2>
                    <Button
                      variant="outline"
                      className="bg-transparent text-sm dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      View all trends
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>

                  <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-4">
                    {trendingProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="group w-64 flex-shrink-0 cursor-pointer transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                      >
                        <CardContent className="p-3">
                          <div className="mb-3 aspect-square h-32 overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-700">
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                {product.name}
                              </h3>
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-xs text-green-700 dark:bg-green-900/50 dark:text-green-300"
                              >
                                {product.trend}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              By {product.brand}
                            </p>
                            <p className="text-sm font-bold dark:text-white">
                              From USD {product.price}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <Card className="dark:border-gray-700 dark:bg-gray-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Products
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold dark:text-white">
                        1,247
                      </div>
                      <p className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        +12% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="dark:border-gray-700 dark:bg-gray-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Orders This Month
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold dark:text-white">
                        89
                      </div>
                      <p className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        +23% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="dark:border-gray-700 dark:bg-gray-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Revenue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold dark:text-white">
                        $2,847
                      </div>
                      <p className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        +18% from last month
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
