import { api } from "@/lib/api";
import {
  Product,
  ProductVariant,
  ProductColor,
  ProductSize,
  ProductView,
  ProductPricing,
} from "@/types";

export interface ProductDetails extends Product {
  colors: ProductColor[];
  sizes: ProductSize[];
  views: ProductView[];
  pricing: ProductPricing;
}

export interface VariantSelection {
  colorId: string;
  sizeId: string;
  viewId: string;
  quantity: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export class ProductService {
  private static instance: ProductService;

  public static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  async getProduct(productId: string): Promise<ProductDetails> {
    try {
      const response = await api.get<ApiResponse<ProductDetails>>(
        `/products/${productId}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to get product");
      }

      return response.data.data;
    } catch (error: any) {
      // For now, return mock data since we don't have the backend endpoint
      return this.getMockProductData(productId);
    }
  }

  async getVariantPricing(
    productId: string,
    selection: VariantSelection
  ): Promise<ProductPricing> {
    try {
      const response = await api.post<ApiResponse<ProductPricing>>(
        `/products/${productId}/pricing`,
        selection
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to get pricing");
      }

      return response.data.data;
    } catch (error: any) {
      // For now, return mock pricing calculation
      return this.calculateMockPricing(selection);
    }
  }

  async checkVariantAvailability(
    productId: string,
    colorId: string,
    sizeId: string
  ): Promise<boolean> {
    try {
      const response = await api.get<
        ApiResponse<{ available: boolean; inventory: number }>
      >(
        `/products/${productId}/availability?colorId=${colorId}&sizeId=${sizeId}`
      );

      if (!response.data.success || !response.data.data) {
        return false;
      }

      return response.data.data.available;
    } catch (error: any) {
      // For now, return mock availability
      return Math.random() > 0.1; // 90% availability rate
    }
  }

  // Mock data methods (remove when backend is ready)
  private getMockProductData(productId: string): ProductDetails {
    return {
      id: productId,
      name: "Premium T-Shirt",
      category: "t-shirts",
      basePrice: 25.99,
      description: "High-quality cotton t-shirt perfect for custom designs",
      images: [
        "/images/tshirt-white-front.jpg",
        "/images/tshirt-white-back.jpg",
      ],
      variants: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      colors: [
        {
          id: "white",
          name: "White",
          value: "white",
          hex: "#ffffff",
          isAvailable: true,
          priceModifier: 0,
        },
        {
          id: "black",
          name: "Black",
          value: "black",
          hex: "#000000",
          isAvailable: true,
          priceModifier: 0,
        },
        {
          id: "navy",
          name: "Navy Blue",
          value: "navy",
          hex: "#1e3a8a",
          isAvailable: true,
          priceModifier: 2,
        },
        {
          id: "red",
          name: "Red",
          value: "red",
          hex: "#dc2626",
          isAvailable: true,
          priceModifier: 2,
        },
        {
          id: "green",
          name: "Forest Green",
          value: "green",
          hex: "#16a34a",
          isAvailable: false,
          priceModifier: 2,
        },
        {
          id: "gray",
          name: "Heather Gray",
          value: "gray",
          hex: "#6b7280",
          isAvailable: true,
          priceModifier: 1,
        },
      ],
      sizes: [
        {
          id: "xs",
          name: "Extra Small",
          value: "XS",
          isAvailable: true,
          priceModifier: 0,
          dimensions: {
            width: 16,
            height: 20,
            printArea: { width: 12, height: 16 },
          },
        },
        {
          id: "s",
          name: "Small",
          value: "S",
          isAvailable: true,
          priceModifier: 0,
          dimensions: {
            width: 18,
            height: 22,
            printArea: { width: 12, height: 16 },
          },
        },
        {
          id: "m",
          name: "Medium",
          value: "M",
          isAvailable: true,
          priceModifier: 0,
          dimensions: {
            width: 20,
            height: 24,
            printArea: { width: 12, height: 16 },
          },
        },
        {
          id: "l",
          name: "Large",
          value: "L",
          isAvailable: true,
          priceModifier: 2,
          dimensions: {
            width: 22,
            height: 26,
            printArea: { width: 12, height: 16 },
          },
        },
        {
          id: "xl",
          name: "Extra Large",
          value: "XL",
          isAvailable: true,
          priceModifier: 4,
          dimensions: {
            width: 24,
            height: 28,
            printArea: { width: 12, height: 16 },
          },
        },
        {
          id: "xxl",
          name: "Double Extra Large",
          value: "XXL",
          isAvailable: false,
          priceModifier: 6,
          dimensions: {
            width: 26,
            height: 30,
            printArea: { width: 12, height: 16 },
          },
        },
      ],
      views: [
        {
          id: "front",
          name: "Front",
          value: "front",
          image: "/images/tshirt-front.jpg",
          printArea: { x: 280, y: 220, width: 120, height: 160 },
        },
        {
          id: "back",
          name: "Back",
          value: "back",
          image: "/images/tshirt-back.jpg",
          printArea: { x: 280, y: 220, width: 120, height: 160 },
        },
      ],
      pricing: {
        basePrice: 25.99,
        colorModifier: 0,
        sizeModifier: 0,
        customizationFee: 5.0,
        quantity: 1,
        bulkDiscounts: [
          { minQuantity: 5, discountPercentage: 10, discountAmount: 0 },
          { minQuantity: 10, discountPercentage: 15, discountAmount: 0 },
          { minQuantity: 25, discountPercentage: 20, discountAmount: 0 },
          { minQuantity: 50, discountPercentage: 25, discountAmount: 0 },
        ],
        totalPrice: 30.99,
      },
    };
  }

  private calculateMockPricing(selection: VariantSelection): ProductPricing {
    const basePrice = 25.99;
    const customizationFee = 5.0;

    // Mock color and size modifiers
    const colorModifier =
      selection.colorId === "white" || selection.colorId === "black" ? 0 : 2;
    const sizeModifier =
      selection.sizeId === "l"
        ? 2
        : selection.sizeId === "xl"
          ? 4
          : selection.sizeId === "xxl"
            ? 6
            : 0;

    const unitPrice =
      basePrice + colorModifier + sizeModifier + customizationFee;
    let totalPrice = unitPrice * selection.quantity;

    // Apply bulk discounts
    const bulkDiscounts = [
      { minQuantity: 5, discountPercentage: 10, discountAmount: 0 },
      { minQuantity: 10, discountPercentage: 15, discountAmount: 0 },
      { minQuantity: 25, discountPercentage: 20, discountAmount: 0 },
      { minQuantity: 50, discountPercentage: 25, discountAmount: 0 },
    ];

    const applicableDiscount = bulkDiscounts
      .filter((discount) => selection.quantity >= discount.minQuantity)
      .pop();

    if (applicableDiscount) {
      const discountAmount =
        totalPrice * (applicableDiscount.discountPercentage / 100);
      totalPrice -= discountAmount;
      applicableDiscount.discountAmount = discountAmount;
    }

    return {
      basePrice,
      colorModifier,
      sizeModifier,
      customizationFee,
      quantity: selection.quantity,
      bulkDiscounts,
      totalPrice: Math.round(totalPrice * 100) / 100,
    };
  }
}
