import { AdminSidebar } from "@/components/admin-sidebar"
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is NOT admin, redirect to user dashboard
  const role = (user.publicMetadata?.role as string) ||
               (user.unsafeMetadata?.role as string) ||
               "user";

  if (role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-muted/30 lg:ml-64 pt-16 lg:pt-0 min-w-0">{children}</main>
    </div>
  )
}
