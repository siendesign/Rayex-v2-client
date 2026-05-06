"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="RayEx Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="text-xl font-semibold">RayEx</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#exchange"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Exchange
            </Link>
            <Link
              href="#rates"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Rates
            </Link>
            <Link
              href="#business"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Business
            </Link>
            <Link
              href="#about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <SignedIn>
              <Link href="/dashboard/orders">
                <Button variant="ghost">My Orders</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </SignedOut>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="#exchange"
              className="block py-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              Exchange
            </Link>
            <Link
              href="#rates"
              className="block py-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              Rates
            </Link>
            <Link
              href="#business"
              className="block py-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              Business
            </Link>
            <Link
              href="#about"
              className="block py-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <div className="pt-3 space-y-2 border-t pt-4">
              <SignedIn>
                <Link
                  href="/dashboard/orders"
                  onClick={() => setIsOpen(false)}
                  className="block py-2"
                >
                  <Button variant="ghost" className="w-full justify-start">
                    My Orders
                  </Button>
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block py-2"
                >
                  <Button variant="outline" className="w-full">
                    Dashboard
                  </Button>
                </Link>
                <div className="flex justify-center py-2">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
              <SignedOut>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block py-2"
                >
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block py-2"
                >
                  <Button className="w-full">Get Started</Button>
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
