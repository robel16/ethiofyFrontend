import { api } from "@/lib/api";

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_id?: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  fulfillment_status: "pending" | "partial" | "complete" | "cancelled";
  total_amount: number;
  currency: string;
  items: OrderItem[];
  shipping_address: Address;
  billing_address: Address;
  payment_info: PaymentInfo;
  tracking_info?: TrackingInfo;
  notes?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  customization?: {
    design_id?: string;
    design_placement?: {
      print_area: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
      rotation?: number;
      scale?: number;
    };
    text?: string;
    text_placement?: {
      print_area: string;
      position: { x: number; y: number };
      font_size?: number;
      color?: string;
      rotation?: number;
    };
    color?: string;
    size?: string;
  };
  merchant_id: string;
  store_id: string;
}

export interface Address {
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface PaymentInfo {
  payment_method: string;
  payment_id: string;
  amount: number;
  currency: string;
  status: string;
  transaction_id: string;
}

export interface TrackingInfo {
  tracking_number: string;
  carrier: string;
  estimated_delivery?: string;
}

export interface OrderSummary {
  total_orders: number;
  total_spent: number;
  orders_by_status: Record<string, number>;
  recent_orders: Order[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export class OrderService {
  private static instance: OrderService;
  private baseUrl = "http://localhost:3007/api";

  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  // Customer Orders
  async getOrders(options?: {
    status?: string;
    fulfillment_status?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ orders: Order[]; pagination: any }> {
    try {
      const params = new URLSearchParams();
      if (options?.status) params.append("status", options.status);
      if (options?.fulfillment_status)
        params.append("fulfillment_status", options.fulfillment_status);
      if (options?.date_from) params.append("date_from", options.date_from);
      if (options?.date_to) params.append("date_to", options.date_to);
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.offset) params.append("offset", options.offset.toString());

      const response = await api.get<ApiResponse<Order[]>>(
        `${this.baseUrl}/orders?${params}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to get orders");
      }

      return {
        orders: response.data.data,
        pagination: response.data.pagination || {},
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get orders");
    }
  }

  async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await api.get<ApiResponse<Order>>(
        `${this.baseUrl}/orders/${orderId}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to get order");
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get order");
    }
  }

  async getOrderSummary(options?: {
    date_from?: string;
    date_to?: string;
  }): Promise<OrderSummary> {
    try {
      const params = new URLSearchParams();
      if (options?.date_from) params.append("date_from", options.date_from);
      if (options?.date_to) params.append("date_to", options.date_to);

      const response = await api.get<ApiResponse<OrderSummary>>(
        `${this.baseUrl}/orders/summary?${params}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to get order summary");
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get order summary"
      );
    }
  }

  // Provider Orders
  async getProviderOrders(
    providerId: string,
    options?: {
      status?: string;
      fulfillment_status?: string;
      date_from?: string;
      date_to?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ orders: Order[]; pagination: any }> {
    try {
      const params = new URLSearchParams();
      if (options?.status) params.append("status", options.status);
      if (options?.fulfillment_status)
        params.append("fulfillment_status", options.fulfillment_status);
      if (options?.date_from) params.append("date_from", options.date_from);
      if (options?.date_to) params.append("date_to", options.date_to);
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.offset) params.append("offset", options.offset.toString());

      const response = await api.get<ApiResponse<Order[]>>(
        `${this.baseUrl}/orders/provider/${providerId}?${params}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to get provider orders"
        );
      }

      return {
        orders: response.data.data,
        pagination: response.data.pagination || {},
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get provider orders"
      );
    }
  }

  // Order Management
  async updateOrderStatus(
    orderId: string,
    status: string,
    notes?: string
  ): Promise<Order> {
    try {
      const response = await api.put<ApiResponse<Order>>(
        `${this.baseUrl}/orders/${orderId}/status`,
        { status, notes }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to update order status"
        );
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update order status"
      );
    }
  }

  async updateTracking(
    orderId: string,
    trackingInfo: {
      tracking_number: string;
      carrier: string;
      estimated_delivery?: string;
    }
  ): Promise<Order> {
    try {
      const response = await api.put<ApiResponse<Order>>(
        `${this.baseUrl}/orders/${orderId}/tracking`,
        trackingInfo
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to update tracking");
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update tracking"
      );
    }
  }

  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    try {
      const response = await api.post<ApiResponse<Order>>(
        `${this.baseUrl}/orders/${orderId}/cancel`,
        { reason }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to cancel order");
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to cancel order"
      );
    }
  }
}
