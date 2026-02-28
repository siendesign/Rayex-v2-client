"use client";

import { useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useAppDispatch } from "@/state/redux";
import { setUser, clearUser } from "@/state/index";
import { useSyncUserMutation } from "@/state/api";

/**
 * AuthSync Component
 *
 * This component syncs Clerk authentication with:
 * 1. Redux global state (for UI access to user data)
 * 2. Backend database (via API mutation)
 * 3. localStorage (for RTK Query auth tokens)
 *
 * Add this to your root layout
 */
export function AuthSync() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const dispatch = useAppDispatch();

  // RTK Query mutation to sync user to database
  const [syncUser, { isLoading }] = useSyncUserMutation();

  useEffect(() => {
    if (!isLoaded) return;

    const syncAuthState = async () => {
      try {
        // Get Clerk token for API authentication
        const token = await getToken();

        if (token) {
          localStorage.setItem("clerk_token", token);
        } else {
          localStorage.removeItem("clerk_token");
        }

        if (user) {
          // User is authenticated
          const role =
            (user.publicMetadata?.role as string) ||
            (user.unsafeMetadata?.role as string) ||
            "user";

          const userData = {
            id: user.id,
            name: user.fullName || user.firstName || "User",
            email: user.primaryEmailAddress?.emailAddress || "",
            role: role as "user" | "admin",
          };

          // 1. Update Redux global state
          dispatch(setUser(userData));

          // Check if we need to trigger a login email
          let triggerEmail = false;
          if (user.lastSignInAt) {
            const loginSessionKey = `rayex_login_${user.id}_${user.lastSignInAt.getTime()}`;
            if (!localStorage.getItem(loginSessionKey)) {
              triggerEmail = true;
              localStorage.setItem(loginSessionKey, "true");
            }
          }

          // 2. Sync to database via API
          await syncUser({
            clerkId: user.id,
            name: userData.name,
            email: userData.email,
            phone: user.primaryPhoneNumber?.phoneNumber || undefined,
            role: role,
            triggerEmail,
            metadata: {
              imageUrl: user.imageUrl,
              firstName: user.firstName,
              lastName: user.lastName,
              createdAt: user.createdAt,
            },
          }).unwrap();
        } else {
          // User is not authenticated
          dispatch(clearUser());
        }
      } catch (error) {
        console.error("Failed to sync auth state:", error);
      }
    };

    syncAuthState();

    // Refresh token every 5 minutes
    const interval = setInterval(
      async () => {
        try {
          const token = await getToken({ skipCache: true });
          if (token) {
            localStorage.setItem("clerk_token", token);
          }
        } catch (error) {
          console.error("Failed to refresh token:", error);
        }
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [user, isLoaded, getToken, dispatch, syncUser]);

  // Optional: Show loading state
  if (!isLoaded) {
    return null;
  }

  return null;
}
