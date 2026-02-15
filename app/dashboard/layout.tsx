import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { DashboardNav } from "@/components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user;
  try {
    user = await currentUser();
  } catch (error) {
    console.error("[DashboardLayout] Clerk API Error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Connection Error</h1>
          <p className="text-muted-foreground">
            We're having trouble connecting to our authentication servers. This is likely a DNS issue on your network.
          </p>
          <div className="bg-background/50 p-4 rounded-lg text-sm font-mono text-left overflow-x-auto">
            Error: Unable to resolve api.clerk.com
          </div>
          <p className="text-sm">
            Please check your network settings or try again later.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry Connection
          </a>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect("/login");
  }

  // Check if user is banned
  const isBanned = (user.publicMetadata?.banned as boolean) || false;

  if (isBanned) {
    redirect("/banned");
  }

  // Check if user is admin, redirect to admin dashboard
  const role = (user.publicMetadata?.role as string) ||
    (user.unsafeMetadata?.role as string) ||
    "user";

  if (role === "admin") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav />
      {children}
    </div>
  );
}
