import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin, redirect to admin dashboard
  const role = (user.publicMetadata?.role as string) ||
               (user.unsafeMetadata?.role as string) ||
               "user";

  if (role === "admin") {
    redirect("/admin");
  }

  return <>{children}</>;
}
