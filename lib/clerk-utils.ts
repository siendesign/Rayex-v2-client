import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Get the current user's role from Clerk metadata
 * @returns "user" | "admin" | null
 */
export async function getUserRole(): Promise<"user" | "admin" | null> {
  const user = await currentUser();

  if (!user) return null;

  // Check public metadata first (set by admin/backend)
  const roleFromPublic = user.publicMetadata?.role as string;
  if (roleFromPublic === "admin" || roleFromPublic === "user") {
    return roleFromPublic;
  }

  // Fallback to unsafe metadata (set during signup)
  const roleFromUnsafe = user.unsafeMetadata?.role as string;
  if (roleFromUnsafe === "admin" || roleFromUnsafe === "user") {
    return roleFromUnsafe;
  }

  // Default to user role
  return "user";
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "admin";
}

/**
 * Get the user ID from the current session
 */
export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Get the current user's email
 */
export async function getUserEmail(): Promise<string | null> {
  const user = await currentUser();
  return user?.emailAddresses[0]?.emailAddress || null;
}
