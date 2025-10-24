"use client";

import React from "react";
import {
  User,
  Settings,
  LogOut,
  CreditCard,
  Bell,
  Sparkles,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";

interface NavUserProps {
  user: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    role?: string;
  };
  sidebarOpen?: boolean;
  onAccountClick?: () => void;
  onBillingClick?: () => void;
  onNotificationsClick?: () => void;
  onSignOutClick?: () => void;
}

export function NavUser({
  user,
  sidebarOpen = true,
  onAccountClick,
  onBillingClick,
  onNotificationsClick,
  onSignOutClick,
}: NavUserProps) {
  const { logout } = useAuth();

  const handleSignOut = async () => {
    if (onSignOutClick) {
      onSignOutClick();
    } else {
      await logout();
    }
  };

  const getInitials = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    if (user.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getDisplayName = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    return user.email.split("@")[0];
  };

  if (!sidebarOpen) {
    // Collapsed sidebar - show only avatar with dropdown
    return (
      <div className="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                    {getInitials()}
                  </span>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-64">
            {/* User Info Header */}
            <div className="flex items-center gap-3 border-b p-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                    {getInitials()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {getDisplayName()}
                </p>
                <p className="truncate text-xs text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>

            <DropdownMenuItem
              onClick={onAccountClick}
              className="cursor-pointer"
            >
              <Sparkles className="mr-3 h-4 w-4" />
              Upgrade to Pro
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onAccountClick}
              className="cursor-pointer"
            >
              <User className="mr-3 h-4 w-4" />
              Account
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onBillingClick}
              className="cursor-pointer"
            >
              <CreditCard className="mr-3 h-4 w-4" />
              Billing
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onNotificationsClick}
              className="cursor-pointer"
            >
              <Bell className="mr-3 h-4 w-4" />
              Notifications
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto w-full justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                    {getInitials()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {getDisplayName()}
                </p>
                <p className="truncate text-xs text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>
            <ChevronUp className="h-4 w-4 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-64">
          <DropdownMenuItem onClick={onAccountClick} className="cursor-pointer">
            <Sparkles className="mr-3 h-4 w-4" />
            Upgrade to Pro
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onAccountClick} className="cursor-pointer">
            <User className="mr-3 h-4 w-4" />
            Account
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onBillingClick} className="cursor-pointer">
            <CreditCard className="mr-3 h-4 w-4" />
            Billing
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={onNotificationsClick}
            className="cursor-pointer"
          >
            <Bell className="mr-3 h-4 w-4" />
            Notifications
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleSignOut}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
