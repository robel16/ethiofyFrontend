import { api } from "@/lib/api";

export interface InventoryItem {
  id: string;
  product_id: string;
  variant_id?: string;
  provider_id: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  reorder_point: number;
  max_stock_level?: number;
  cost_per_unit?: number;
  location?: string;
  sku?: string;
  status: "in_stock" | "low_stock" | "out_of_stock" | "discontinued";
  metadata?: Record<string, any>;
  last_movement?: {
    type: string;
    quantity: number;
    timestamp: string;
  };
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  inventory_item_id: string;
  type:
    | "sale"
    | "restock"
    | "adjustment"
    | "reservation"
    | "fulfillment"
    | "return"
    | "damage";
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface StockReservation {
  id: string;
  order_id: string;
  status: "active" | "fulfilled" | "released" | "expired";
  items: ReservationItem[];
  expires_at: string;
  fulfilled_at?: string;
  released_at?: string;
  fulfillment_notes?: string;
  created_at: string;
}

export interface ReservationItem {
  inventory_item_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  reserved: boolean;
}

export interface InventoryAlert {
  id: string;
  type: "low_stock" | "out_of_stock" | "overstock" | "expired" | "damaged";
  severity: "high" | "medium" | "low";
  inventory_item_id: string;
  product_id: string;
  variant_id?: string;
  provider_id: string;
  message: string;
  current_quantity: number;
  reorder_point?: number;
  status: "active" | "resolved";
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  created_at: string;
}

export interface InventoryStats {
  overview: {
    total_items: number;
    total_quantity: number;
    total_value: number;
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
  };
  by_status: {
    in_stock: { count: number; percentage: number };
    low_stock: { count: number; percentage: number };
    out_of_stock: { count: number; percentage: number };
  };
  movements_summary: {
    total_movements: number;
    sales: number;
    restocks: number;
    adjustments: number;
  };
  top_selling_items: Array<{
    product_id: string;
    variant_id?: string;
    sku?: string;
    sales_count: number;
    revenue: number;
  }>;
}

export interface ProductAvailability {
  product_id: string;
  variant_id?: string;
  available: boolean;
  quantity_available: number;
  providers: Array<{
    provider_id: string;
    available_quantity: number;
    estimated_fulfillment_time: string;
  }>;
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

export class InventoryService {
  private static instance: InventoryService;
  private baseUrl = "http://localhost:3007/api";

  public static getInstance(): InventoryService {
    if (!InventoryService.instance) {
      InventoryService.instance = new InventoryService();
    }
    return InventoryService.instance;
  }

  // Public Routes
  async checkProductAvailability(
    productId: string,
    options?: {
      variantId?: string;
      quantity?: number;
      providerId?: string;
    }
  ): Promise<ProductAvailability> {
    try {
      const params = new URLSearchParams();
      params.append("product_id", productId);
      if (options?.variantId) params.append("variant_id", options.variantId);
      if (options?.quantity)
        params.append("quantity", options.quantity.toString());
      if (options?.providerId) params.append("provider_id", options.providerId);

      const response = await api.get<ApiResponse<ProductAvailability>>(
        `${this.baseUrl}/inventory/availability?${params}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to check product availability"
        );
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to check product availability"
      );
    }
  }

  // Inventory Management
  async createInventoryItem(itemData: {
    product_id: string;
    variant_id?: string;
    provider_id: string;
    quantity: number;
    reserved_quantity?: number;
    reorder_point?: number;
    max_stock_level?: number;
    cost_per_unit?: number;
    location?: string;
    sku?: string;
    metadata?: Record<string, any>;
  }): Promise<InventoryItem> {
    try {
      const response = await api.post<
        ApiResponse<{ inventory_item: InventoryItem }>
      >(`${this.baseUrl}/inventory/items`, itemData);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to create inventory item"
        );
      }

      return response.data.data.inventory_item;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create inventory item"
      );
    }
  }

  async getInventoryItem(itemId: string): Promise<InventoryItem> {
    try {
      const response = await api.get<
        ApiResponse<{ inventory_item: InventoryItem }>
      >(`${this.baseUrl}/inventory/items/${itemId}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to get inventory item"
        );
      }

      return response.data.data.inventory_item;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get inventory item"
      );
    }
  }

  async updateInventoryItem(
    itemId: string,
    updates: {
      quantity?: number;
      reorder_point?: number;
      max_stock_level?: number;
      cost_per_unit?: number;
      location?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<InventoryItem> {
    try {
      const response = await api.put<
        ApiResponse<{ inventory_item: InventoryItem }>
      >(`${this.baseUrl}/inventory/items/${itemId}`, updates);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to update inventory item"
        );
      }

      return response.data.data.inventory_item;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update inventory item"
      );
    }
  }

  async getMovementHistory(
    itemId: string,
    options?: {
      limit?: number;
      offset?: number;
      date_from?: string;
      date_to?: string;
      movement_type?: string;
    }
  ): Promise<{ movements: InventoryMovement[]; pagination: any }> {
    try {
      const params = new URLSearchParams();
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.offset) params.append("offset", options.offset.toString());
      if (options?.date_from) params.append("date_from", options.date_from);
      if (options?.date_to) params.append("date_to", options.date_to);
      if (options?.movement_type)
        params.append("movement_type", options.movement_type);

      const response = await api.get<
        ApiResponse<{ movements: InventoryMovement[] }>
      >(`${this.baseUrl}/inventory/items/${itemId}/movements?${params}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to get movement history"
        );
      }

      return {
        movements: response.data.data.movements,
        pagination: response.data.pagination || {},
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get movement history"
      );
    }
  }

  // Stock Reservations
  async reserveStock(reservationData: {
    items: Array<{
      product_id: string;
      variant_id?: string;
      quantity: number;
      provider_id: string;
    }>;
    order_id: string;
    expires_at?: string;
  }): Promise<StockReservation> {
    try {
      const response = await api.post<
        ApiResponse<{ reservation: StockReservation }>
      >(`${this.baseUrl}/inventory/reservations`, reservationData);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to reserve stock");
      }

      return response.data.data.reservation;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to reserve stock"
      );
    }
  }

  async releaseReservation(
    reservationId: string,
    reason?: string
  ): Promise<StockReservation> {
    try {
      const response = await api.post<
        ApiResponse<{ reservation: StockReservation }>
      >(`${this.baseUrl}/inventory/reservations/release`, {
        reservation_id: reservationId,
        reason,
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to release reservation"
        );
      }

      return response.data.data.reservation;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to release reservation"
      );
    }
  }

  async fulfillReservation(
    reservationId: string,
    fulfillmentNotes?: string
  ): Promise<StockReservation> {
    try {
      const response = await api.post<
        ApiResponse<{ reservation: StockReservation }>
      >(`${this.baseUrl}/inventory/reservations/${reservationId}/fulfill`, {
        fulfillment_notes: fulfillmentNotes,
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to fulfill reservation"
        );
      }

      return response.data.data.reservation;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fulfill reservation"
      );
    }
  }

  // Provider Inventory
  async getProviderInventory(
    providerId: string,
    options?: {
      product_id?: string;
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    provider_id: string;
    inventory_items: InventoryItem[];
    summary: {
      total_items: number;
      in_stock: number;
      low_stock: number;
      out_of_stock: number;
      total_value: number;
    };
    pagination: any;
  }> {
    try {
      const params = new URLSearchParams();
      if (options?.product_id) params.append("product_id", options.product_id);
      if (options?.status) params.append("status", options.status);
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.offset) params.append("offset", options.offset.toString());

      const response = await api.get<
        ApiResponse<{
          provider_id: string;
          inventory_items: InventoryItem[];
          summary: any;
        }>
      >(`${this.baseUrl}/inventory/providers/${providerId}?${params}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to get provider inventory"
        );
      }

      return {
        ...response.data.data,
        pagination: response.data.pagination || {},
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get provider inventory"
      );
    }
  }

  // Stock Monitoring
  async getLowStockItems(options?: {
    provider_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ low_stock_items: InventoryItem[]; pagination: any }> {
    try {
      const params = new URLSearchParams();
      if (options?.provider_id)
        params.append("provider_id", options.provider_id);
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.offset) params.append("offset", options.offset.toString());

      const response = await api.get<
        ApiResponse<{ low_stock_items: InventoryItem[] }>
      >(`${this.baseUrl}/inventory/low-stock?${params}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to get low stock items"
        );
      }

      return {
        low_stock_items: response.data.data.low_stock_items,
        pagination: response.data.pagination || {},
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get low stock items"
      );
    }
  }

  async getOutOfStockItems(options?: {
    provider_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ out_of_stock_items: InventoryItem[]; pagination: any }> {
    try {
      const params = new URLSearchParams();
      if (options?.provider_id)
        params.append("provider_id", options.provider_id);
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.offset) params.append("offset", options.offset.toString());

      const response = await api.get<
        ApiResponse<{ out_of_stock_items: InventoryItem[] }>
      >(`${this.baseUrl}/inventory/out-of-stock?${params}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to get out of stock items"
        );
      }

      return {
        out_of_stock_items: response.data.data.out_of_stock_items,
        pagination: response.data.pagination || {},
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get out of stock items"
      );
    }
  }

  async getInventoryStats(options?: {
    provider_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<InventoryStats> {
    try {
      const params = new URLSearchParams();
      if (options?.provider_id)
        params.append("provider_id", options.provider_id);
      if (options?.date_from) params.append("date_from", options.date_from);
      if (options?.date_to) params.append("date_to", options.date_to);

      const response = await api.get<ApiResponse<InventoryStats>>(
        `${this.baseUrl}/inventory/stats?${params}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to get inventory stats"
        );
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get inventory stats"
      );
    }
  }

  // Alerts Management
  async getUnresolvedAlerts(options?: {
    provider_id?: string;
    alert_type?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    alerts: InventoryAlert[];
    summary: {
      total_alerts: number;
      by_type: Record<string, number>;
      by_severity: Record<string, number>;
    };
    pagination: any;
  }> {
    try {
      const params = new URLSearchParams();
      if (options?.provider_id)
        params.append("provider_id", options.provider_id);
      if (options?.alert_type) params.append("alert_type", options.alert_type);
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.offset) params.append("offset", options.offset.toString());

      const response = await api.get<
        ApiResponse<{
          alerts: InventoryAlert[];
          summary: any;
        }>
      >(`${this.baseUrl}/inventory/alerts?${params}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to get alerts");
      }

      return {
        ...response.data.data,
        pagination: response.data.pagination || {},
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get alerts");
    }
  }

  async resolveAlert(
    alertId: string,
    resolutionData?: {
      resolution_notes?: string;
      action_taken?: string;
    }
  ): Promise<InventoryAlert> {
    try {
      const response = await api.post<ApiResponse<{ alert: InventoryAlert }>>(
        `${this.baseUrl}/inventory/alerts/${alertId}/resolve`,
        resolutionData
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to resolve alert");
      }

      return response.data.data.alert;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to resolve alert"
      );
    }
  }
}
