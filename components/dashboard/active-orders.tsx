"use client"

import { useState } from "react"
import { Clock, CheckCircle2, AlertCircle, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const orders = [
  {
    id: "ORD-2024-001",
    from: { currency: "USD", amount: "5,000.00", flag: "🇺🇸" },
    to: { currency: "EUR", amount: "4,600.00", flag: "🇪🇺" },
    status: "pending_payment" as const,
    createdAt: "Dec 23, 2024 - 10:30 AM",
    destination: "Deutsche Bank - DE89 3704 0044 0532 0130 00",
    rate: "0.92",
  },
  {
    id: "ORD-2024-002",
    from: { currency: "BTC", amount: "0.15", flag: "₿" },
    to: { currency: "GBP", amount: "3,250.00", flag: "🇬🇧" },
    status: "processing" as const,
    createdAt: "Dec 22, 2024 - 3:45 PM",
    destination: "Barclays Bank - GB29 NWBK 6016 1331 9268 19",
    rate: "21,666.67",
  },
  {
    id: "ORD-2024-003",
    from: { currency: "EUR", amount: "2,000.00", flag: "🇪🇺" },
    to: { currency: "JPY", amount: "327,400.00", flag: "🇯🇵" },
    status: "completed" as const,
    createdAt: "Dec 21, 2024 - 11:20 AM",
    destination: "MUFG Bank - JP98 7654 3210 1234 5678",
    rate: "163.7",
  },
]

const statusConfig = {
  pending_payment: {
    label: "Waiting for Payment",
    variant: "secondary" as const,
    icon: Clock,
  },
  processing: {
    label: "Processing",
    variant: "default" as const,
    icon: Clock,
  },
  completed: {
    label: "Completed",
    variant: "secondary" as const,
    icon: CheckCircle2,
  },
}

export function ActiveOrders() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="bg-card rounded-2xl border p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-semibold">Your Exchange Orders</h3>
        <Button variant="ghost" size="sm" className="text-primary text-xs md:text-sm">
          View All
        </Button>
      </div>

      <div className="space-y-3 md:space-y-4">
        {orders.map((order) => {
          const status = statusConfig[order.status]
          const StatusIcon = status.icon

          return (
            <div
              key={order.id}
              className="border rounded-xl p-3 md:p-5 hover:border-primary/50 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-medium">
                      {order.id}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(order.id, order.id)}
                    >
                      <Copy className={`w-3 h-3 ${copied === order.id ? "text-green-600" : "text-muted-foreground"}`} />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">{order.createdAt}</div>
                </div>
                <Badge variant={status.variant} className="flex items-center gap-1.5">
                  <StatusIcon className="w-3.5 h-3.5" />
                  {status.label}
                </Badge>
              </div>

              {/* Exchange Details */}
              <div className="bg-muted rounded-lg p-3 md:p-4 mb-3 md:mb-4">
                <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">You send</div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{order.from.flag}</span>
                      <div>
                        <div className="font-semibold">
                          {order.from.amount} {order.from.currency}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Recipient gets</div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{order.to.flag}</span>
                      <div>
                        <div className="font-semibold">
                          {order.to.amount} {order.to.currency}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                  Rate: 1 {order.from.currency} = {order.rate} {order.to.currency}
                </div>
              </div>

              {/* Destination */}
              <div className="mb-4">
                <div className="text-xs text-muted-foreground mb-1">Destination Account</div>
                <div className="flex items-center gap-2 text-sm font-mono bg-muted p-2 rounded">
                  <span className="flex-1 truncate">{order.destination}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => copyToClipboard(order.destination, `${order.id}-dest`)}
                  >
                    <Copy className={`w-3 h-3 ${copied === `${order.id}-dest` ? "text-green-600" : "text-muted-foreground"}`} />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              {order.status === "pending_payment" && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium mb-1">
                        Waiting for your payment
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">
                        Send {order.from.amount} {order.from.currency} to our account to process this order
                      </div>
                      <Button size="sm" variant="default">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Payment Details
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {order.status === "processing" && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm">
                      Processing your exchange... Estimated completion in 2-24 hours
                    </span>
                  </div>
                </div>
              )}

              {order.status === "completed" && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm">
                      Successfully sent to destination account
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
