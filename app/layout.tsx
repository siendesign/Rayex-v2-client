import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google"; // Commented out due to build network error
import { Inter } from "next/font/google"; // Trying Inter as it might be cached or standard, or just use system fonts if this fails too.
import { ClerkProvider } from "@clerk/nextjs";
import StoreProvider from "@/state/redux";
import { AuthSync } from "@/components/auth-sync";
import "./globals.css";

// Actually, let's just use system fonts to be safe for now.

/*
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
*/

// Fallback font variables
const geistSans = { variable: "font-sans" };
const geistMono = { variable: "font-mono" };

export const metadata: Metadata = {
  title: "RayEx - Currency Exchange Made Simple",
  description:
    "The fastest way to exchange currency and send money globally. Transparent fees and real-time exchange rates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log(
    "[RootLayout] Clerk PK exists:",
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );
  console.log("[RootLayout] Clerk SK exists:", !!process.env.CLERK_SECRET_KEY);

  return (
    <ClerkProvider>
      <StoreProvider>
        <AuthSync />
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
          >
            {children}
          </body>
        </html>
      </StoreProvider>
    </ClerkProvider>
  );
}
