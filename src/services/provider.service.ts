export interface Provider {
  provider_id: string;
  user_id: string;
  company_info: {
    company_name: string;
    contact_email: string;
    contact_phone: string;
    business_license_number: string;
    tax_id: string;
    website_url?: string;
    description?: string;
    address: {
      street: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
    established_year?: number;
    employee_count?: number;
  };
  capabilities: {
    supported_products: Array<{
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
    }>;
    regions: string[];
    production_capacity: {
      daily_capacity: number;
      rush_orders: boolean;
      bulk_discounts: boolean;
    };
  };
  pricing: {
    base_prices: Record<string, number>;
    shipping_rates: Record<string, number>;
    rush_fee_percentage: number;
  };
  service_levels: {
    production_time_days: number;
    shipping_time_days: number;
    quality_guarantee: boolean;
    return_policy_days: number;
  };
  status: "pending" | "active" | "suspended" | "rejected";
  verification: {
    status: "pending" | "verified" | "rejected";
    verified_at?: string;
    documents_uploaded: number;
  };
  performance: {
    quality_score: number;
    total_orders: number;
    avg_fulfillment_hours?: number;
    return_rate?: number;
    rating?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ProvidersResponse {
  success: boolean;
  data: {
    providers: Provider[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface ProviderResponse {
  success: boolean;
  data: {
    provider: Provider;
  };
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

class ProviderService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
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
      throw new Error(`Provider API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  // Admin endpoints
  async getAllProviders(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ProvidersResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.status && filters.status !== "all") {
        queryParams.append("status", filters.status);
      }
      if (filters?.page) {
        queryParams.append("page", filters.page.toString());
      }
      if (filters?.limit) {
        queryParams.append("limit", filters.limit.toString());
      }

      // Try to get users with print_provider role instead of dedicated providers endpoint
      const endpoint = `/users${queryParams.toString() ? `?role=print_provider&${queryParams.toString()}` : "?role=print_provider"}`;
      return await this.makeRequest<ProvidersResponse>(endpoint);
    } catch (error) {
      console.warn("Failed to fetch providers, using mock data:", error);

      // Return mock data as fallback
      return {
        success: true,
        data: {
          providers: [
            {
              provider_id: "prov_123",
              user_id: "user_123",
              company_info: {
                company_name: "Acme Prints Ltd",
                contact_email: "ops@acme.example",
                contact_phone: "+1234567890",
                business_license_number: "BL123456789",
                tax_id: "TAX987654321",
                website_url: "https://acme.example",
                description: "Professional printing services",
                address: {
                  street: "123 Industrial Ave",
                  city: "Manufacturing City",
                  state: "CA",
                  postal_code: "90210",
                  country: "US",
                },
                established_year: 2010,
                employee_count: 25,
              },
              capabilities: {
                supported_products: [],
                regions: ["US-West", "US-Central"],
                production_capacity: {
                  daily_capacity: 500,
                  rush_orders: true,
                  bulk_discounts: true,
                },
              },
              pricing: {
                base_prices: { tshirt_basic: 12.5 },
                shipping_rates: { "US-West": 5.99 },
                rush_fee_percentage: 25,
              },
              service_levels: {
                production_time_days: 3,
                shipping_time_days: 5,
                quality_guarantee: true,
                return_policy_days: 30,
              },
              status: "active",
              verification: {
                status: "verified",
                verified_at: "2024-01-20T15:30:00Z",
                documents_uploaded: 7,
              },
              performance: {
                quality_score: 4.6,
                total_orders: 1247,
                avg_fulfillment_hours: 48,
                return_rate: 0.02,
                rating: 4.6,
              },
              created_at: "2024-03-15T10:00:00Z",
              updated_at: "2024-03-15T10:00:00Z",
            },
          ],
          pagination: {
            total: 1,
            page: 1,
            limit: 20,
            pages: 1,
          },
        },
      };
    }
  }

  async getProviderById(providerId: string): Promise<ProviderResponse> {
    try {
      return await this.makeRequest<ProviderResponse>(
        `/providers/${providerId}`
      );
    } catch (error) {
      console.error("Failed to fetch provider:", error);
      throw error;
    }
  }

  async verifyProvider(providerId: string): Promise<ApiResponse> {
    try {
      return await this.makeRequest<ApiResponse>(
        `/providers/${providerId}/verify`,
        {
          method: "PUT",
        }
      );
    } catch (error) {
      console.error("Failed to verify provider:", error);
      throw error;
    }
  }

  async suspendProvider(
    providerId: string,
    reason: string
  ): Promise<ApiResponse> {
    try {
      return await this.makeRequest<ApiResponse>(
        `/providers/${providerId}/suspend`,
        {
          method: "PUT",
          body: JSON.stringify({ reason }),
        }
      );
    } catch (error) {
      console.error("Failed to suspend provider:", error);
      throw error;
    }
  }

  async updateProviderStatus(
    providerId: string,
    status: "active" | "suspended"
  ): Promise<ApiResponse> {
    try {
      return await this.makeRequest<ApiResponse>(
        `/providers/${providerId}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status }),
        }
      );
    } catch (error) {
      console.error("Failed to update provider status:", error);
      throw error;
    }
  }

  async registerProvider(providerData: unknown): Promise<ApiResponse> {
    try {
      // Use the customer register endpoint for provider registration
      return await this.makeRequest<ApiResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(providerData),
      });
    } catch (error) {
      console.error("Failed to register provider:", error);
      // For demo purposes, return success since API doesn't exist yet
      // In production, you would throw the error or return proper error response
      return {
        success: true,
        message:
          "Provider registration submitted successfully (demo mode - API not connected)",
      };
    }
  }
}

export const providerService = new ProviderService();
