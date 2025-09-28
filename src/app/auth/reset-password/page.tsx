"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
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
import { resetPasswordSchema, ResetPasswordInput } from "@/lib/validations";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resetPassword, isLoading } = useAuthActions();

  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      router.push("/auth/forgot-password");
      return;
    }
    setValue("token", token);
  }, [token, router, setValue]);

  const onSubmit = async (data: ResetPasswordInput) => {
    const result = await resetPassword(data);
    if (result.success) {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Ethiofy</h1>
            <p className="mt-2 text-sm text-gray-600">
              Print-on-Demand Platform
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Password Reset Successful</CardTitle>
              <CardDescription>
                Your password has been successfully reset.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-center">
                <p className="text-sm text-gray-600">
                  You can now sign in with your new password.
                </p>
                <Link href="/auth/login">
                  <Button className="w-full">Sign In</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!token) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Ethiofy</h1>
          <p className="mt-2 text-sm text-gray-600">Print-on-Demand Platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input type="hidden" {...register("token")} />

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    {...register("password")}
                    className={
                      errors.password ? "border-red-500 pr-10" : "pr-10"
                    }
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Password must contain at least 8 characters with uppercase,
                  lowercase, number, and special character.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    {...register("confirm_password")}
                    className={
                      errors.confirm_password ? "border-red-500 pr-10" : "pr-10"
                    }
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-sm text-red-500">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="text-sm text-primary hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
