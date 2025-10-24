import { ENV } from "@/lib/env";

export interface AdminKPIData {
  totalOrders: {
    value: number;
    change: number;
    trend: "up" | "down";
  };
  grossRevenue: {
    value: number;
    change: number;
    trend: "up" | "down";
  };
  netRevenue: {
    value: number;
    change: number;
    trend: "up" | "down";
  };
  outstandingPayouts: {
    value: number;
    change: number;
    trend: "up" | "down";
  };
  refundRate: {
    value: number;
    change: number;
    trend: "up" | "down";
  };
  avgProductionTime: {
    value: number;
    change: number;
    trend: "up" | "down";
  };
}

export interface TopProvider {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  rating: number;
  country: string;
}

export interface TopProduct {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  margin: string;
}

export interface OrdersByCountry {
  country: string;
  orders: number;
  percentage: number;
}

export interface AdminDashboardData {
  kpis: AdminKPIData;
  topProviders: TopProvider[];
  topProducts: TopProduct[];
  ordersByCountry: OrdersByCountry[];
}

class AdminService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = ENV.API_BASE_URL || "http://localhost:3001";
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Admin API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  async getDashboardData(): Promise<AdminDashboardData> {
    try {
      // Try to fetch real data from API
      const data =
        await this.makeRequest<AdminDashboardData>("/admin/dashboard");
      return data;
    } catch (error) {
      console.warn(
        "Failed to fetch admin dashboard data, using mock data:",
        error
      );

      // Return mock data as fallback
      return {
        kpis: {
          totalOrders: {
            value: 12847,
            change: 12.5,
            trend: "up",
          },
          grossRevenue: {
            value: 284750,
            change: 8.2,
            trend: "up",
          },
          netRevenue: {
            value: 256275,
            change: 7.8,
            trend: "up",
          },
          outstandingPayouts: {
            value: 45230,
            change: -5.2,
            trend: "down",
          },
          refundRate: {
            value: 2.4,
            change: 0.3,
            trend: "up",
          },
          avgProductionTime: {
            value: 2.8,
            change: -0.5,
            trend: "down",
          },
        },
        topProviders: [
          {
            id: "1",
            name: "Acme Prints Ltd",
            orders: 1247,
            revenue: 28450,
            rating: 4.8,
            country: "DE",
          },
          {
            id: "2",
            name: "PrintCraft Pro",
            orders: 892,
            revenue: 21340,
            rating: 4.6,
            country: "US",
          },
          {
            id: "3",
            name: "Quality Prints Inc",
            orders: 756,
            revenue: 18920,
            rating: 4.7,
            country: "GB",
          },
          {
            id: "4",
            name: "Express Print Co",
            orders: 634,
            revenue: 15680,
            rating: 4.5,
            country: "CA",
          },
          {
            id: "5",
            name: "Digital Print Hub",
            orders: 523,
            revenue: 12890,
            rating: 4.4,
            country: "AU",
          },
        ],
        topProducts: [
          {
            id: "1",
            name: "Classic Cotton T-Shirt",
            orders: 2847,
            revenue: 42705,
            margin: "65%",
          },
          {
            id: "2",
            name: "Premium Hoodie",
            orders: 1923,
            revenue: 57690,
            margin: "58%",
          },
          {
            id: "3",
            name: "Canvas Tote Bag",
            orders: 1456,
            revenue: 21840,
            margin: "72%",
          },
          {
            id: "4",
            name: "Ceramic Mug",
            orders: 1234,
            revenue: 18510,
            margin: "68%",
          },
          {
            id: "5",
            name: "Phone Case",
            orders: 987,
            revenue: 29610,
            margin: "75%",
          },
        ],
        ordersByCountry: [
          { country: "United States", orders: 4521, percentage: 35 },
          { country: "Germany", orders: 2847, percentage: 22 },
          { country: "United Kingdom", orders: 1923, percentage: 15 },
          { country: "Canada", orders: 1456, percentage: 11 },
          { country: "Australia", orders: 1234, percentage: 10 },
          { country: "Others", orders: 866, percentage: 7 },
        ],
      };
    }
  }

  async getProviders(filters?: {
    search?: string;
    status?: string;
    country?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.search) queryParams.append("search", filters.search);
      if (filters?.status && filters.status !== "all")
        queryParams.append("status", filters.status);
      if (filters?.country && filters.country !== "all")
        queryParams.append("country", filters.country);
      if (filters?.page) queryParams.append("page", filters.page.toString());
      if (filters?.limit) queryParams.append("limit", filters.limit.toString());

      const endpoint = `/admin/providers${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      return await this.makeRequest(endpoint);
    } catch (error) {
      console.warn("Failed to fetch providers, using mock data:", error);
      // Return mock providers data
      return {
        providers: [],
        total: 0,
        page: 1,
        totalPages: 1,
      };
    }
  }

  async getOrders(filters?: {
    search?: string;
    status?: string;
    provider?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.search) queryParams.append("search", filters.search);
      if (filters?.status && filters.status !== "all")
        queryParams.append("status", filters.status);
      if (filters?.provider && filters.provider !== "all")
        queryParams.append("provider", filters.provider);
      if (filters?.page) queryParams.append("page", filters.page.toString());
      if (filters?.limit) queryParams.append("limit", filters.limit.toString());

      const endpoint = `/admin/orders${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      return await this.makeRequest(endpoint);
    } catch (error) {
      console.warn("Failed to fetch orders, using mock data:", error);
      // Return mock orders data
      return {
        orders: [],
        total: 0,
        page: 1,
        totalPages: 1,
      };
    }
  }
}

export const adminService = new AdminService();
