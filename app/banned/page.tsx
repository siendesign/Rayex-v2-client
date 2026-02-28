"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Mail, LogOut } from "lucide-react";

export default function BannedPage() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    // Clear login track keys so emails send on next login
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("rayex_login_")) {
        localStorage.removeItem(key);
      }
    });
    await signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <Card className="max-w-md w-full border-red-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">
            Account Suspended
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Your account has been suspended by an administrator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              Your access to RayEx has been restricted. This may be due to a
              violation of our terms of service or other security concerns.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">
              What you can do:
            </p>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>Contact our support team to appeal this decision</li>
              <li>Review our terms of service for more information</li>
              <li>Sign out and create a new account if eligible</li>
            </ul>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              className="w-full"
              variant="default"
              onClick={() =>
                (window.location.href =
                  "mailto:support@rayex.com?subject=Account Suspension Appeal")
              }
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>

            <Button
              className="w-full"
              variant="outline"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500 pt-4 border-t">
            Need immediate assistance? Email us at{" "}
            <a
              href="mailto:support@rayex.com"
              className="text-blue-600 hover:underline"
            >
              support@rayex.com
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
