"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
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
import { ProtectedRoute } from "@/components/auth/protected-route";
import { toast } from "react-hot-toast";
import { apiClient } from "@/lib/api";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileInput = z.infer<typeof profileSchema>;
type PasswordInput = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const passwordForm = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdateProfile = async (data: ProfileInput) => {
    setIsUpdatingProfile(true);
    try {
      const response = await apiClient.put("/auth/profile", data);

      if (response.data.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onUpdatePassword = async (data: PasswordInput) => {
    setIsUpdatingPassword(true);
    try {
      const response = await apiClient.put("/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (response.data.success) {
        toast.success("Password updated successfully!");
        passwordForm.reset();
      } else {
        toast.error(response.data.message || "Failed to update password");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account information and security
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={profileForm.handleSubmit(onUpdateProfile)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...profileForm.register("name")}
                    className={
                      profileForm.formState.errors.name ? "border-red-500" : ""
                    }
                  />
                  {profileForm.formState.errors.name && (
                    <p className="text-sm text-red-500">
                      {profileForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...profileForm.register("email")}
                    className={
                      profileForm.formState.errors.email ? "border-red-500" : ""
                    }
                  />
                  {profileForm.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {profileForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={user.role} disabled />
                </div>

                <Button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full"
                >
                  {isUpdatingProfile ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={passwordForm.handleSubmit(onUpdatePassword)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...passwordForm.register("currentPassword")}
                    className={
                      passwordForm.formState.errors.currentPassword
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-red-500">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...passwordForm.register("newPassword")}
                    className={
                      passwordForm.formState.errors.newPassword
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-500">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register("confirmPassword")}
                    className={
                      passwordForm.formState.errors.confirmPassword
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full"
                >
                  {isUpdatingPassword ? "Updating..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
