"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Settings,
  LogOut,
  ArrowRightLeft,
  Menu,
  X,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function DashboardNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    // Clear login track keys so emails send on next login
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("rayex_login_")) {
        localStorage.removeItem(key);
      }
    });
    await signOut();
    router.push("/");
  };

  const userName = user?.fullName || "User";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <nav className="border-b bg-background sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <ArrowRightLeft className="size-4 text-primary-foreground" />
              </div>
              <span className="text-lg md:text-xl font-semibold">RayEx</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6 ml-8 flex-1">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/orders"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                My Orders
              </Link>
            </div>

            {/* Desktop Right Actions */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="size-5" />
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full"></span>
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="size-5" />
              </Button>
              <div className="w-px h-6 bg-border mx-2"></div>
              <div className="flex items-center gap-3">
                <div className="hidden lg:block text-right">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
                <div className="size-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold">
                    {userInitials}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="size-5" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="size-6" />
              ) : (
                <Menu className="size-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="px-4 py-4 space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="size-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold">
                    {userInitials}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                  >
                    <ArrowRightLeft className="size-5" />
                    <span>Dashboard</span>
                  </Button>
                </Link>
                <Link
                  href="/dashboard/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                  >
                    <Clock className="size-5" />
                    <span>My Orders</span>
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <Bell className="size-5" />
                  <span>Notifications</span>
                  <span className="ml-auto size-2 bg-red-500 rounded-full"></span>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <Settings className="size-5" />
                  <span>Settings</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-red-600 hover:text-red-600"
                  onClick={handleSignOut}
                >
                  <LogOut className="size-5" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
