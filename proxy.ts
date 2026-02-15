import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/signup(.*)",
  "/api/webhooks(.*)",
  "/auth-callback",
  "/banned",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const url = req.nextUrl.pathname;

  console.log(`[Clerk Middleware] Path: ${url}, UserId: ${userId || 'none'}`);

  // Allow public routes
  if (isPublicRoute(req)) {
    console.log(`[Clerk Middleware] Public route allowed: ${url}`);
    return;
  }

  // Protect all non-public routes
  console.log(`[Clerk Middleware] Protecting route: ${url}`);
  try {
    await auth.protect();
  } catch (error) {
    console.log(`[Clerk Middleware] auth.protect() threw error for ${url}:`, error);
    throw error;
  }

  // Check if user is banned (from Clerk publicMetadata)
  const publicMetadata = sessionClaims?.publicMetadata as { banned?: boolean } | undefined;
  const isBanned = publicMetadata?.banned === true;

  console.log(`[Clerk Middleware] UserId: ${userId}, IsBanned: ${isBanned}`);

  // If user is banned and not already on banned page, redirect to banned page
  if (isBanned && url !== "/banned") {
    console.log(`[Clerk Middleware] Redirecting banned user to /banned`);
    const bannedUrl = new URL("/banned", req.url);
    return NextResponse.redirect(bannedUrl);
  }

  // If user is not banned but somehow on banned page, redirect to dashboard
  if (!isBanned && url === "/banned" && userId) {
    console.log(`[Clerk Middleware] Redirecting non-banned user to /dashboard`);
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
