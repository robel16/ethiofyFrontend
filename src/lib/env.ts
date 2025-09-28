// Environment variables validation and access
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://username:password@localhost:5432/pod_platform"),
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
  NEXTAUTH_SECRET: z
    .string()
    .min(1)
    .default("your-secret-key-here-development"),
  API_BASE_URL: z.string().url().default("http://localhost:3001/api"),
  API_TIMEOUT: z.coerce.number().default(30000),
  MAX_FILE_SIZE: z.coerce.number().default(10485760),
  ALLOWED_FILE_TYPES: z
    .string()
    .default("image/jpeg,image/png,image/webp,image/svg+xml"),
  STARPAY_PUBLIC_KEY: z.string().min(1).default("pk_test_development_key"),
  STARPAY_SECRET_KEY: z.string().min(1).default("sk_test_development_key"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  ENABLE_DESIGN_STUDIO: z.coerce.boolean().default(true),
  ENABLE_ANALYTICS: z.coerce.boolean().default(true),
  ENABLE_PWA: z.coerce.boolean().default(true),
});

// Validate environment variables
const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error("❌ Invalid environment variables:", env.error.format());
  throw new Error("Invalid environment variables");
}

export const ENV = env.data;

// Helper functions
export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment = process.env.NODE_ENV === "development";
export const isTest = process.env.NODE_ENV === "test";
