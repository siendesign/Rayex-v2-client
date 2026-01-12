"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { ArrowRightLeft, Copy, CheckCircle2, AlertCircle, Clock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OrderPaymentPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.orderId as string

  const [copied, setCopied] = useState<string | null>(null)

  // Mock order data - in real app this would come from API
  const order = {
    id: orderId,
    from: { currency: "USD", amount: "5,000.00", flag: "🇺🇸" },
    to: { currency: "EUR", amount: "4,600.00", flag: "🇪🇺" },
    paymentMethod: "bank",
  }

  const bankDetails = {
    bankName: "RayEx International Bank",
    accountName: "RayEx Ltd.",
    accountNumber: "1234567890",
    routingNumber: "021000021",
    swift: "RAYXUS33",
    iban: "GB29 NWBK 6016 1331 9268 19",
    reference: order.id,
  }

  const cryptoDetails = {
    network: "Bitcoin",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    amount: "0.15 BTC",
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const isBank = order.paymentMethod === "bank"

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <ArrowRightLeft className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold">Order Payment Instructions</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Order Created Successfully!</h2>
              <p className="text-muted-foreground mb-3">
                Your order <span className="font-mono font-semibold">{order.id}</span> has been created. Please
                send your payment to complete the exchange.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>Please send payment within 24 hours to lock in the current rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-2xl border p-6 mb-6">
          <h3 className="font-semibold mb-4">Order Summary</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-muted rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">You send</div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{order.from.flag}</span>
                <div>
                  <div className="text-2xl font-bold">{order.from.amount}</div>
                  <div className="text-sm text-muted-foreground">{order.from.currency}</div>
                </div>
              </div>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">Recipient receives</div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{order.to.flag}</span>
                <div>
                  <div className="text-2xl font-bold">{order.to.amount}</div>
                  <div className="text-sm text-muted-foreground">{order.to.currency}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="bg-card rounded-2xl border p-6 mb-6">
          <div className="flex items-start gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-2">
                Send {order.from.amount} {order.from.currency} to the following{" "}
                {isBank ? "bank account" : "crypto address"}:
              </h3>
              <p className="text-sm text-muted-foreground">
                Important: Include the reference number to ensure your payment is processed correctly.
              </p>
            </div>
          </div>

          {isBank ? (
            <div className="space-y-4">
              {/* Bank Name */}
              <div className="border-b pb-4">
                <div className="text-sm text-muted-foreground mb-1">Bank Name</div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{bankDetails.bankName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.bankName, "bankName")}
                  >
                    {copied === "bankName" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Account Name */}
              <div className="border-b pb-4">
                <div className="text-sm text-muted-foreground mb-1">Account Name</div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{bankDetails.accountName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.accountName, "accountName")}
                  >
                    {copied === "accountName" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Account Number */}
              <div className="border-b pb-4">
                <div className="text-sm text-muted-foreground mb-1">Account Number</div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-medium">{bankDetails.accountNumber}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.accountNumber, "accountNumber")}
                  >
                    {copied === "accountNumber" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Routing Number */}
              <div className="border-b pb-4">
                <div className="text-sm text-muted-foreground mb-1">Routing Number</div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-medium">{bankDetails.routingNumber}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.routingNumber, "routingNumber")}
                  >
                    {copied === "routingNumber" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* SWIFT */}
              <div className="border-b pb-4">
                <div className="text-sm text-muted-foreground mb-1">SWIFT / BIC</div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-medium">{bankDetails.swift}</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(bankDetails.swift, "swift")}>
                    {copied === "swift" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* IBAN */}
              <div className="border-b pb-4">
                <div className="text-sm text-muted-foreground mb-1">IBAN</div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-medium">{bankDetails.iban}</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(bankDetails.iban, "iban")}>
                    {copied === "iban" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Reference - Most Important */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold mb-1">Payment Reference (Required)</div>
                    <div className="text-xs text-muted-foreground mb-3">
                      You must include this reference in your bank transfer
                    </div>
                    <div className="flex items-center justify-between bg-card rounded p-3">
                      <span className="font-mono font-bold text-lg">{bankDetails.reference}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankDetails.reference, "reference")}
                      >
                        {copied === "reference" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Crypto Network */}
              <div className="border-b pb-4">
                <div className="text-sm text-muted-foreground mb-1">Network</div>
                <span className="font-medium">{cryptoDetails.network}</span>
              </div>

              {/* Amount */}
              <div className="border-b pb-4">
                <div className="text-sm text-muted-foreground mb-1">Exact Amount to Send</div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-medium">{cryptoDetails.amount}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(cryptoDetails.amount, "cryptoAmount")}
                  >
                    {copied === "cryptoAmount" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Wallet Address */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold mb-1">Wallet Address</div>
                    <div className="text-xs text-muted-foreground mb-3">
                      Send {cryptoDetails.amount} to this address only
                    </div>
                    <div className="flex items-center justify-between bg-card rounded p-3">
                      <span className="font-mono text-sm break-all">{cryptoDetails.address}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                        onClick={() => copyToClipboard(cryptoDetails.address, "cryptoAddress")}
                      >
                        {copied === "cryptoAddress" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-4">What happens next?</h3>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                1
              </span>
              <span>
                Send {order.from.amount} {order.from.currency} using the details above
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                2
              </span>
              <span>We&apos;ll confirm receipt of your payment (usually within 1 hour)</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                3
              </span>
              <span>We&apos;ll exchange your currency at the locked rate</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                4
              </span>
              <span>Money arrives in recipient&apos;s account (2-24 hours)</span>
            </li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={() => router.push("/dashboard")} className="flex-1 h-12">
            Go to Dashboard
          </Button>
          <Button variant="outline" className="flex-1 h-12">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  )
}
