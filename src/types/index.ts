// Core types for the POD platform
export interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export interface PODDesign {
  id: string;
  userId: string;
  name: string;
  category: string;
  designData: Record<string, any>;
  previewUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  description: string;
  images: string[];
  variants: ProductVariant[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  sku: string;
  inventory: number;
  attributes: Record<string, string>;
  color?: ProductColor;
  size?: ProductSize;
  isAvailable: boolean;
  images?: string[];
}

export interface ProductColor {
  id: string;
  name: string;
  value: string;
  hex: string;
  isAvailable: boolean;
  priceModifier?: number;
}

export interface ProductSize {
  id: string;
  name: string;
  value: string;
  isAvailable: boolean;
  priceModifier?: number;
  dimensions?: {
    width: number;
    height: number;
    printArea: {
      width: number;
      height: number;
    };
  };
}

export interface ProductView {
  id: string;
  name: string;
  value: string;
  image: string;
  printArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ProductPricing {
  basePrice: number;
  colorModifier: number;
  sizeModifier: number;
  customizationFee: number;
  quantity: number;
  bulkDiscounts: BulkDiscount[];
  totalPrice: number;
}

export interface BulkDiscount {
  minQuantity: number;
  discountPercentage: number;
  discountAmount: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  designId?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
