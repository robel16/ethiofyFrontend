import { api } from "@/lib/api";

export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview_url: string;
  customizable_elements: {
    text_areas: TextArea[];
    image_areas: ImageArea[];
  };
  compatible_products: string[];
  created_at: string;
}

export interface TextArea {
  id: string;
  name: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  default_text: string;
  font_family: string;
  font_size: number;
  color: string;
}

export interface ImageArea {
  id: string;
  name: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  accepts_upload: boolean;
}

export interface Design {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  status: "processing" | "ready" | "failed";
  original_file: {
    filename: string;
    file_url: string;
    file_size: number;
    mime_type: string;
  };
  processed_files?: {
    preview_urls: string[];
    print_ready_url: string;
    thumbnail_url: string;
  };
  specifications: {
    dimensions: { width: number; height: number; unit: string };
    resolution: number;
    color_mode: string;
    has_transparency?: boolean;
  };
  print_compatibility?: {
    suitable_products: string[];
    print_methods: string[];
    size_constraints: {
      min_width: number;
      min_height: number;
      max_width: number;
      max_height: number;
    };
  };
  usage_rights?: {
    is_original: boolean;
    has_commercial_license: boolean;
    copyright_info: string;
  };
  view_count?: number;
  download_count?: number;
  created_at: string;
  processed_at?: string;
}

export interface CustomOrder {
  id: string;
  design_id: string;
  design_name?: string;
  product_template_id: string;
  provider_id: string;
  provider_name?: string;
  customer_id?: string;
  status:
    | "submitted"
    | "under_review"
    | "approved"
    | "in_production"
    | "completed"
    | "rejected";
  customization: {
    design_placement: DesignPlacement[];
    text_additions?: TextAddition[];
    color_modifications?: ColorModification[];
    special_instructions?: string;
  };
  specifications: {
    quantity: number;
    material: string;
    size: string;
    finish?: string;
    rush_order?: boolean;
  };
  pricing?: {
    design_cost: number;
    setup_fee: number;
    unit_cost: number;
    total_cost: number;
  };
  provider_notes?: string;
  estimated_completion?: string;
  created_at: string;
  updated_at?: string;
}

export interface DesignPlacement {
  area_id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation?: number;
  scale?: number;
  opacity?: number;
}

export interface TextAddition {
  id: string;
  text: string;
  position: { x: number; y: number };
  font_family: string;
  font_size: number;
  color: string;
  alignment: string;
  rotation?: number;
  font_weight?: string;
}

export interface ColorModification {
  element_id: string;
  original_color: string;
  new_color: string;
  color_type: string;
}

export interface PlacementValidation {
  valid: boolean;
  warnings: string[];
  errors: string[];
  print_area_bounds?: {
    max_width: number;
    max_height: number;
    position: { x: number; y: number };
  };
  design_bounds?: {
    final_x: number;
    final_y: number;
    final_width: number;
    final_height: number;
  };
  suggestions: string[];
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

export class DesignService {
  private static instance: DesignService;
  private baseUrl = "http://localhost:3008/api";

  public static getInstance(): DesignService {
    if (!DesignService.instance) {
      DesignService.instance = new DesignService();
    }
    return DesignService.instance;
  }

  // Public Routes
  async getDesignTemplates(options?: {
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ templates: DesignTemplate[]; pagination: any }> {
    try {
      const params = new URLSearchParams();
      if (options?.category) params.append("category", options.category);
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.offset) params.append("offset", options.offset.toString());

      const response = await api.get<
        ApiResponse<{ templates: DesignTemplate[] }>
      >(`${this.baseUrl}/designs/templates?${params}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to get design templates"
        );
      }

      return {
        templates: response.data.data.templates,
        pagination: response.data.pagination || {},
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get design templates"
      );
    }
  }

  async searchDesigns(options?: {
    q?: string;
    category?: string;
    tags?: string;
    compatible_products?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ designs: Design[]; pagination: any }> {
    try {
      const params = new URLSearchParams();
      if (options?.q) params.append("q", options.q);
      if (options?.category) params.append("category", options.category);
      if (options?.tags) params.append("tags", options.tags);
      if (options?.compatible_products)
        params.append("compatible_products", options.compatible_products);
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.offset) params.append("offset", options.offset.toString());

      const response = await api.get<ApiResponse<{ designs: Design[] }>>(
        `${this.baseUrl}/designs/search?${params}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to search designs");
      }

      return {
        designs: response.data.data.designs,
        pagination: response.data.pagination || {},
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to search designs"
      );
    }
  }

  // Design Management
  async uploadDesign(formData: FormData): Promise<Design> {
    try {
      const response = await api.post<ApiResponse<{ design: Design }>>(
        `${this.baseUrl}/designs/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to upload design");
      }

      return response.data.data.design;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to upload design"
      );
    }
  }

  async getCustomerDesigns(options?: {
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ designs: Design[]; pagination: any }> {
    try {
      const params = new URLSearchParams();
      if (options?.category) params.append("category", options.category);
      if (options?.status) params.append("status", options.status);
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.offset) params.append("offset", options.offset.toString());

      const response = await api.get<ApiResponse<{ designs: Design[] }>>(
        `${this.baseUrl}/designs/my-designs?${params}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to get customer designs"
        );
      }

      return {
        designs: response.data.data.designs,
        pagination: response.data.pagination || {},
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get customer designs"
      );
    }
  }

  async getDesign(designId: string): Promise<Design> {
    try {
      const response = await api.get<ApiResponse<{ design: Design }>>(
        `${this.baseUrl}/designs/${designId}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to get design");
      }

      return response.data.data.design;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get design");
    }
  }

  // Custom Orders
  async createCustomOrder(orderData: {
    design_id: string;
    product_template_id: string;
    provider_id: string;
    customization: {
      design_placement: DesignPlacement[];
      text_additions?: TextAddition[];
      color_modifications?: ColorModification[];
    };
    specifications: {
      quantity: number;
      material: string;
      size: string;
      finish?: string;
      rush_order?: boolean;
    };
    special_instructions?: string;
  }): Promise<CustomOrder> {
    try {
      const response = await api.post<
        ApiResponse<{ custom_order: CustomOrder }>
      >(`${this.baseUrl}/designs/custom-orders`, orderData);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to create custom order"
        );
      }

      return response.data.data.custom_order;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create custom order"
      );
    }
  }

  async getCustomerCustomOrders(options?: {
    status?: string;
    provider_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ custom_orders: CustomOrder[]; pagination: any }> {
    try {
      const params = new URLSearchParams();
      if (options?.status) params.append("status", options.status);
      if (options?.provider_id)
        params.append("provider_id", options.provider_id);
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.offset) params.append("offset", options.offset.toString());

      const response = await api.get<
        ApiResponse<{ custom_orders: CustomOrder[] }>
      >(`${this.baseUrl}/designs/custom-orders/my-orders?${params}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to get customer custom orders"
        );
      }

      return {
        custom_orders: response.data.data.custom_orders,
        pagination: response.data.pagination || {},
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get customer custom orders"
      );
    }
  }

  async getProviderCustomOrders(
    providerId: string,
    options?: {
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ custom_orders: CustomOrder[]; pagination: any }> {
    try {
      const params = new URLSearchParams();
      if (options?.status) params.append("status", options.status);
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.offset) params.append("offset", options.offset.toString());

      const response = await api.get<
        ApiResponse<{ custom_orders: CustomOrder[] }>
      >(
        `${this.baseUrl}/designs/providers/${providerId}/custom-orders?${params}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to get provider custom orders"
        );
      }

      return {
        custom_orders: response.data.data.custom_orders,
        pagination: response.data.pagination || {},
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get provider custom orders"
      );
    }
  }

  async updateCustomOrderStatus(
    orderId: string,
    statusData: {
      status: string;
      provider_notes?: string;
      estimated_completion?: string;
      pricing?: {
        design_cost: number;
        setup_fee: number;
        unit_cost: number;
        total_cost: number;
      };
    }
  ): Promise<CustomOrder> {
    try {
      const response = await api.put<
        ApiResponse<{ custom_order: CustomOrder }>
      >(`${this.baseUrl}/designs/custom-orders/${orderId}/status`, statusData);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to update custom order status"
        );
      }

      return response.data.data.custom_order;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update custom order status"
      );
    }
  }

  // Validation
  async validateDesignPlacement(validationData: {
    product_id: string;
    variant_id?: string;
    design_id: string;
    design_placement: DesignPlacement;
  }): Promise<PlacementValidation> {
    try {
      const response = await api.post<
        ApiResponse<{ validation: PlacementValidation }>
      >(`${this.baseUrl}/products/design/validate-placement`, validationData);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to validate design placement"
        );
      }

      return response.data.data.validation;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to validate design placement"
      );
    }
  }

  async validateTextPlacement(validationData: {
    product_id: string;
    variant_id?: string;
    text_placement: {
      print_area: string;
      content: string;
      position: { x: number; y: number };
      font_family?: string;
      font_size?: number;
      color?: string;
      alignment?: string;
      rotation?: number;
      font_weight?: string;
    };
  }): Promise<PlacementValidation> {
    try {
      const response = await api.post<
        ApiResponse<{ validation: PlacementValidation }>
      >(`${this.baseUrl}/products/text/validate-placement`, validationData);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || "Failed to validate text placement"
        );
      }

      return response.data.data.validation;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to validate text placement"
      );
    }
  }
}
