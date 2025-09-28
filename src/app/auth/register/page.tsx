"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthActions } from "@/hooks/use-auth";
import { registerSchema, RegisterInput } from "@/lib/validations";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuthActions();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    // Default role to customer for public registration
    const registrationData = {
      ...data,
      role: "customer" as const,
    };
    await registerUser(registrationData);
  };

  return (
    <div className="grid-pattern relative min-h-screen overflow-hidden bg-background">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white/30 to-purple-50/50 dark:from-blue-950/20 dark:via-background/50 dark:to-purple-950/20"></div>

      {/* Floating Elements */}
      <div className="absolute left-10 top-20 h-20 w-20 animate-pulse rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-xl"></div>
      <div className="absolute right-20 top-40 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-xl delay-1000"></div>
      <div className="delay-2000 absolute bottom-20 left-20 h-24 w-24 animate-pulse rounded-full bg-gradient-to-br from-green-400/20 to-blue-400/20 blur-xl"></div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-8">
          {/* Back Button */}
          <div className="flex items-center">
            <Link
              href="/"
              className="group flex items-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to home
            </Link>
          </div>

          {/* Header */}
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
                <Sparkles className="h-6 w-6 animate-pulse text-white" />
              </div>
              <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-3xl font-bold text-transparent">
                Ethiofy
              </h1>
            </div>
            <p className="text-muted-foreground">
              Start your creative journey today
            </p>
          </div>

          {/* Register Card */}
          <Card className="border-0 bg-card/80 shadow-2xl backdrop-blur-sm">
            <CardHeader className="pb-4 text-center">
              <CardTitle className="text-2xl font-bold">
                Create your account
              </CardTitle>
              <CardDescription className="text-base">
                Enter your information to get started
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-sm font-medium">
                      First Name
                    </Label>
                    <Input
                      id="first_name"
                      type="text"
                      placeholder="Enter your first name"
                      {...register("first_name")}
                      className={`h-12 ${errors.first_name ? "border-destructive focus:ring-destructive" : "border-border focus:ring-primary"} bg-background/50 backdrop-blur-sm`}
                    />
                    {errors.first_name && (
                      <p className="text-sm text-destructive">
                        {errors.first_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-sm font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="last_name"
                      type="text"
                      placeholder="Enter your last name"
                      {...register("last_name")}
                      className={`h-12 ${errors.last_name ? "border-destructive focus:ring-destructive" : "border-border focus:ring-primary"} bg-background/50 backdrop-blur-sm`}
                    />
                    {errors.last_name && (
                      <p className="text-sm text-destructive">
                        {errors.last_name.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register("email")}
                    className={`h-12 ${errors.email ? "border-destructive focus:ring-destructive" : "border-border focus:ring-primary"} bg-background/50 backdrop-blur-sm`}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Hidden role field - defaults to customer */}
                <input type="hidden" value="customer" {...register("role")} />

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register("password")}
                      className={`h-12 pr-12 ${errors.password ? "border-destructive focus:ring-destructive" : "border-border focus:ring-primary"} bg-background/50 backdrop-blur-sm`}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Must contain at least 8 characters with uppercase,
                    lowercase, number, and special character.
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirm_password"
                    className="text-sm font-medium"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      {...register("confirm_password")}
                      className={`h-12 pr-12 ${errors.confirm_password ? "border-destructive focus:ring-destructive" : "border-border focus:ring-primary"} bg-background/50 backdrop-blur-sm`}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirm_password && (
                    <p className="text-sm text-destructive">
                      {errors.confirm_password.message}
                    </p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3">
                  <input
                    id="terms_accepted"
                    type="checkbox"
                    {...register("terms_accepted")}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="terms_accepted"
                    className="text-sm leading-relaxed text-muted-foreground"
                  >
                    I accept the{" "}
                    <Link
                      href="/terms"
                      className="text-primary transition-colors hover:text-primary/80"
                    >
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-primary transition-colors hover:text-primary/80"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.terms_accepted && (
                  <p className="text-sm text-destructive">
                    {errors.terms_accepted.message}
                  </p>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="h-12 w-full bg-gradient-to-r from-primary to-accent font-medium text-white shadow-lg transition-all duration-200 hover:from-primary/90 hover:to-accent/90 hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
