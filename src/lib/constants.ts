// Application constants
export const APP_CONFIG = {
  name: "Ethiofy POD Platform",
  description: "Print-on-Demand platform for Ethiopian designs",
  version: "1.0.0",
  author: "Ethiofy Team",
} as const;

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    profile: "/auth/profile",
  },
  products: {
    list: "/products",
    create: "/products",
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
  },
  designs: {
    list: "/designs",
    create: "/designs",
    update: (id: string) => `/designs/${id}`,
    delete: (id: string) => `/designs/${id}`,
  },
  orders: {
    list: "/orders",
    create: "/orders",
    update: (id: string) => `/orders/${id}`,
    track: (id: string) => `/orders/${id}/track`,
  },
} as const;

export const ROUTES = {
  home: "/",
  login: "/auth/login",
  register: "/auth/register",
  dashboard: "/dashboard",
  products: "/products",
  designs: "/designs",
  orders: "/orders",
  profile: "/profile",
  designStudio: "/design-studio",
} as const;

export const PRODUCT_CATEGORIES = [
  "t-shirts",
  "hoodies",
  "mugs",
  "posters",
  "stickers",
  "phone-cases",
  "tote-bags",
] as const;

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const FILE_UPLOAD = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".svg"],
} as const;
