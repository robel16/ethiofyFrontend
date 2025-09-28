// Validation schemas using Zod
import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  remember_me: z.boolean().optional().default(false),
});

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character"
      ),
    confirm_password: z.string(),
    role: z
      .enum(["customer", "merchant", "print_provider"])
      .optional()
      .default("customer"),
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().min(1).max(100).optional(),
    terms_accepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character"
      ),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

// Product schemas
export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  basePrice: z.number().min(0, "Price must be positive"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
});

// Design schemas
export const designSchema = z.object({
  name: z.string().min(1, "Design name is required"),
  category: z.string().min(1, "Category is required"),
  designData: z.record(z.any()),
});

// Order schemas
export const addressSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
});

export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().min(1),
        designId: z.string().optional(),
      })
    )
    .min(1, "At least one item is required"),
  shippingAddress: addressSchema,
  paymentMethod: z.string().min(1, "Payment method is required"),
});

// File upload schema
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "File size must be less than 10MB"
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(
          file.type
        ),
      "File must be an image (JPEG, PNG, WebP, or SVG)"
    ),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type DesignInput = z.infer<typeof designSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
