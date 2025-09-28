"use client";

import Link from "next/link";
import { useAuth, useAuthActions } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, ShoppingCart, User, LogOut, Settings } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const { logout } = useAuthActions();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-sm font-bold text-primary-foreground">E</span>
          </div>
          <span className="text-xl font-bold">Ethiofy</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-6 md:flex">
          <Link
            href="/products"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Products
          </Link>
          <Link
            href="/design-studio"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Design Studio
          </Link>
          <RoleGuard requiredRoles={["merchant", "admin"]}>
            <Link
              href="/merchant"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Merchant
            </Link>
          </RoleGuard>
          <RoleGuard requiredRole="admin">
            <Link
              href="/admin"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Admin
            </Link>
          </RoleGuard>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Shopping Cart */}
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              0
            </span>
          </Button>

          {/* User Menu */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="border-t bg-background md:hidden">
          <nav className="container space-y-2 py-4">
            <Link
              href="/products"
              className="block px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/design-studio"
              className="block px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Design Studio
            </Link>
            <RoleGuard requiredRoles={["merchant", "admin"]}>
              <Link
                href="/merchant"
                className="block px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Merchant
              </Link>
            </RoleGuard>
            <RoleGuard requiredRole="admin">
              <Link
                href="/admin"
                className="block px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin
              </Link>
            </RoleGuard>
          </nav>
        </div>
      )}
    </header>
  );
}
