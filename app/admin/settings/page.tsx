"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Loader2, CheckCircle2 } from "lucide-react";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/state/api";

export default function AdminSettings() {
  const { data: settings, isLoading, refetch } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] =
    useUpdateSettingsMutation();

  const [notificationEmail, setNotificationEmail] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  // Load backend state into local UI state when data arrives
  useEffect(() => {
    if (settings && settings.notificationEmail) {
      setNotificationEmail(settings.notificationEmail);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaveMessage("");
    try {
      await updateSettings({ notificationEmail }).unwrap();
      setSaveMessage("Settings saved successfully!");
      refetch();
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Failed to update settings:", error);
      setSaveMessage("Failed to save settings.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Configure global platform variables
        </p>
      </div>

      {/* General Settings */}
      <div className="border rounded-lg p-4 md:p-6 bg-card text-card-foreground">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="size-8 md:size-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Globe className="size-4 md:size-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm md:text-base">
              General Settings
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              Core platform configuration
            </p>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4 max-w-2xl">
          <div>
            <Label htmlFor="notificationEmail">Admin Notification Email</Label>
            <p className="text-xs text-muted-foreground mb-2 mt-1">
              The email address where administrative alerts (e.g., new order
              requests) are sent.
            </p>
            <Input
              id="notificationEmail"
              type="email"
              placeholder="admin@example.com"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Save Button & Feedback */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium h-6">
          {saveMessage && (
            <span
              className={
                saveMessage.includes("Failed")
                  ? "text-red-500"
                  : "text-green-500 flex items-center gap-1"
              }
            >
              {!saveMessage.includes("Failed") && (
                <CheckCircle2 className="size-4" />
              )}
              {saveMessage}
            </span>
          )}
        </div>
        <Button onClick={handleSave} disabled={isUpdating} className="px-8">
          {isUpdating ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  );
}
