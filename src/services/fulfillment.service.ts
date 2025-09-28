import { api } from "@/lib/api";

export interface ProviderProfile {
  id: string;
  company_info: {
    company_name: string;
    contact_email: string;
    contact_phone?: string;
    business_license?: string;
    tax_id?: string;
    website_url?: string;
    description?: string;
    logo_url?: string;
  };
  status:
    | "active"
    | "inactive"
    | "maintenance"
    | "suspended"
    | "pending_verification";
  capabilities: {
    supported_products: ProductCapability[];
    regions: string[];
    production_capacity: {
      daily_capacity: number;
      rush_orders: boolean;
      bulk_discounts: boolean;
    };
  };
  pricing: {
    base_prices: Record<string, number>;
    shipping_rates: {
      standard: number;
      expedited: number;
      rush: number;
    };
    rush_fee_percentage: number;
  };
  service_levels: {
    production_time_days: number;
    shipping_time_days: number;
    quality_guarantee: boolean;
    return_policy_days: number;
  };
}

export interface ProductCapability {
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

export interface FulfillmentOrder {
  id: string;
  orderId: string;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "failed"
    | "cancelled";
  orderItems: FulfillmentOrderItem[];
  shippingAddress: Address;
  priority: "standard" | "expedited" | "rush";
  specialInstructions?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FulfillmentOrderItem {
  productId: string;
  variantId: string;
  quantity: number;
  customization: {
    design_url?: string;
    text?: string;
    color?: string;
    size?: string;
  };
}

export interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export class FulfillmentService {
  private static instance: FulfillmentService;
  private baseUrl = "http://localhost:3006/api";

  public static getInstance(): FulfillmentService {
    if (!FulfillmentService.instance) {
      FulfillmentService.instance = new FulfillmentService();
    }
    return FulfillmentService.instance;
  }

  // Provider Management
  async getProfile(): Promise<ProviderProfile> {
    try {
      const response = await api.get<ApiResponse<ProviderProfile>>(
        `${this.baseUrl}/providers/profile`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to get provider profile"
        );
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get provider profile"
      );
    }
  }

  async getProviderProfile(): Promise<ProviderProfile> {
    return this.getProfile();
  }

  async updateProfile(
    data: Partial<ProviderProfile>
  ): Promise<ProviderProfile> {
    try {
      const response = await api.put<ApiResponse<ProviderProfile>>(
        `${this.baseUrl}/providers/profile`,
        data
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to update provider profile"
        );
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update provider profile"
      );
    }
  }

  async updateProviderProfile(
    data: Partial<ProviderProfile>
  ): Promise<ProviderProfile> {
    return this.updateProfile(data);
  }

  async registerProvider(data: any): Promise<ProviderProfile> {
    try {
      const response = await api.post<ApiResponse<ProviderProfile>>(
        `${this.baseUrl}/providers/register`,
        data
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to register provider");
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to register provider"
      );
    }
  }

  async updateProviderStatus(status: string, reason?: string): Promise<void> {
    try {
      const response = await api.put<ApiResponse>(
        `${this.baseUrl}/providers/status`,
        {
          status,
          reason,
        }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to update provider status"
        );
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update provider status"
      );
    }
  }

  // Capabilities Management
  async getCapabilities(): Promise<ProductCapability[]> {
    try {
      const response = await api.get<ApiResponse<ProductCapability[]>>(
        `${this.baseUrl}/providers/capabilities`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to get capabilities");
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get capabilities"
      );
    }
  }

  async addCapability(
    capability: Omit<ProductCapability, "id">
  ): Promise<ProductCapability> {
    try {
      const response = await api.post<ApiResponse<ProductCapability>>(
        `${this.baseUrl}/providers/capabilities`,
        capability
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to add capability");
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to add capability"
      );
    }
  }

  async removeCapability(templateId: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse>(
        `${this.baseUrl}/providers/capabilities/${templateId}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to remove capability");
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to remove capability"
      );
    }
  }

  // Fulfillment Orders
  async getProviderFulfillments(
    providerId: string,
    options?: {
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ fulfillments: FulfillmentOrder[]; pagination: any }> {
    try {
      const params = new URLSearchParams();
      if (options?.status) params.append("status", options.status);
      if (options?.page) params.append("page", options.page.toString());
      if (options?.limit) params.append("limit", options.limit.toString());

      const response = await api.get<ApiResponse<FulfillmentOrder[]>>(
        `${this.baseUrl}/fulfillment/provider/${providerId}?${params}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to get fulfillments");
      }

      return {
        fulfillments: response.data.data,
        pagination: response.data.pagination || {},
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get fulfillments"
      );
    }
  }

  async getFulfillment(fulfillmentId: string): Promise<FulfillmentOrder> {
    try {
      const response = await api.get<ApiResponse<FulfillmentOrder>>(
        `${this.baseUrl}/fulfillment/${fulfillmentId}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to get fulfillment");
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get fulfillment"
      );
    }
  }

  async updateFulfillmentStatus(
    fulfillmentId: string,
    status: string,
    notes?: string
  ): Promise<FulfillmentOrder> {
    try {
      const response = await api.patch<ApiResponse<FulfillmentOrder>>(
        `${this.baseUrl}/fulfillment/${fulfillmentId}/status`,
        { status, notes }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to update fulfillment status"
        );
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update fulfillment status"
      );
    }
  }

  async createFulfillment(fulfillmentData: {
    orderId: string;
    orderItems: FulfillmentOrderItem[];
    shippingAddress: Address;
    priority?: string;
    specialInstructions?: string;
  }): Promise<FulfillmentOrder> {
    try {
      const response = await api.post<ApiResponse<FulfillmentOrder>>(
        `${this.baseUrl}/fulfillment`,
        fulfillmentData
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to create fulfillment"
        );
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create fulfillment"
      );
    }
  }
}
