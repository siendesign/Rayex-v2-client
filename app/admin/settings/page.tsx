"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Bell, Shield, Globe, Zap } from "lucide-react"

export default function AdminSettings() {
  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Configure platform settings and preferences
        </p>
      </div>

      {/* General Settings */}
      <div className="border rounded-lg p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="size-8 md:size-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Globe className="size-4 md:size-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm md:text-base">General Settings</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              Platform configuration
            </p>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          <div>
            <Label htmlFor="platformName">Platform Name</Label>
            <Input
              id="platformName"
              defaultValue="XChange"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              id="supportEmail"
              type="email"
              defaultValue="support@xchange.com"
              className="mt-1"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label htmlFor="minOrder">Minimum Order Amount</Label>
              <Input
                id="minOrder"
                type="number"
                defaultValue="10"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="maxOrder">Maximum Order Amount</Label>
              <Input
                id="maxOrder"
                type="number"
                defaultValue="50000"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="defaultFee">Default Fee (%)</Label>
            <Input
              id="defaultFee"
              type="number"
              step="0.01"
              defaultValue="0.5"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="border rounded-lg p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="size-8 md:size-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Bell className="size-4 md:size-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm md:text-base">Notifications</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              Configure notification preferences
            </p>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="font-medium text-sm md:text-base">New Order Alerts</div>
              <div className="text-xs md:text-sm text-muted-foreground">
                Get notified when a new order is created
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="font-medium text-sm md:text-base">Payment Received</div>
              <div className="text-xs md:text-sm text-muted-foreground">
                Alert when payment is confirmed
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="font-medium text-sm md:text-base">Failed Transactions</div>
              <div className="text-xs md:text-sm text-muted-foreground">
                Immediate alerts for failed transactions
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="font-medium text-sm md:text-base">Daily Reports</div>
              <div className="text-xs md:text-sm text-muted-foreground">
                Receive daily summary reports via email
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="border rounded-lg p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="size-8 md:size-10 rounded-lg bg-red-100 flex items-center justify-center">
            <Shield className="size-4 md:size-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm md:text-base">Security Settings</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              Manage security and authentication
            </p>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="font-medium text-sm md:text-base">Two-Factor Authentication</div>
              <div className="text-xs md:text-sm text-muted-foreground">
                Require 2FA for admin access
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="font-medium text-sm md:text-base">User Verification Required</div>
              <div className="text-xs md:text-sm text-muted-foreground">
                Require identity verification for large orders
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div>
            <Label htmlFor="verificationThreshold">
              Verification Threshold (USD)
            </Label>
            <Input
              id="verificationThreshold"
              type="number"
              defaultValue="1000"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              defaultValue="30"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* API Settings */}
      <div className="border rounded-lg p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="size-8 md:size-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Zap className="size-4 md:size-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm md:text-base">API & Integrations</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              External service configurations
            </p>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          <div>
            <Label htmlFor="exchangeRateAPI">Exchange Rate API Key</Label>
            <Input
              id="exchangeRateAPI"
              type="password"
              defaultValue="••••••••••••••••"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="webhookURL">Webhook URL</Label>
            <Input
              id="webhookURL"
              placeholder="https://your-domain.com/webhook"
              className="mt-1"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="font-medium text-sm md:text-base">Auto-Update Rates</div>
              <div className="text-xs md:text-sm text-muted-foreground">
                Automatically fetch latest exchange rates
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div>
            <Label htmlFor="rateUpdateInterval">
              Rate Update Interval (minutes)
            </Label>
            <Input
              id="rateUpdateInterval"
              type="number"
              defaultValue="5"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Email Templates */}
      <div className="border rounded-lg p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div>
            <h3 className="font-semibold text-sm md:text-base">Email Templates</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              Customize automated email content
            </p>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          <div>
            <Label htmlFor="welcomeEmail">Welcome Email Template</Label>
            <Textarea
              id="welcomeEmail"
              defaultValue="Welcome to XChange! We&apos;re excited to have you..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="orderConfirmation">
              Order Confirmation Template
            </Label>
            <Textarea
              id="orderConfirmation"
              defaultValue="Your order #{ORDER_ID} has been created..."
              rows={3}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="px-8">Save All Settings</Button>
      </div>
    </div>
  )
}
