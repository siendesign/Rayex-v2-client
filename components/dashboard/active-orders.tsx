"use client"

import { useState, useEffect } from "react"
import { Clock, CheckCircle2, AlertCircle, Copy, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@clerk/nextjs"
import { useGetUserOrdersQuery, api } from "@/state/api"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAppDispatch } from "@/state/redux"
import { useSSE } from "@/hooks/useSSE"

const statusConfig = {
  pending_payment: {
    label: "Waiting for Payment",
    variant: "secondary" as const,
    icon: Clock,
  },
  payment_received: {
    label: "Payment Received",
    variant: "default" as const,
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
  failed: {
    label: "Failed",
    variant: "destructive" as const,
    icon: AlertCircle,
  },
  cancelled: {
    label: "Cancelled",
    variant: "outline" as const,
    icon: AlertCircle,
  },
}

export function ActiveOrders() {
  const dispatch = useAppDispatch()
  const { user } = useUser()
  const router = useRouter()
  const userEmail = user?.emailAddresses[0]?.emailAddress
  const { data: response, isLoading, error } = useGetUserOrdersQuery(userEmail ?? "", {
    skip: !userEmail,
  }) // Replace Socket.io with SSE
  const sseUrl = userEmail
    ? `${process.env.NEXT_PUBLIC_API_URL}/realtime/sse?email=${userEmail}`
    : null;

  useSSE({
    url: sseUrl || "",
    events: {
      order_updated: (updatedOrder: any) => {
        console.log('🔔 SSE: Received order_updated:', updatedOrder)
        dispatch(
          api.util.updateQueryData('getUserOrders' as any, userEmail, (draft: any) => {
            if (draft && draft.data) {
              const index = draft.data.findIndex((o: any) => o.id === updatedOrder.id)
              if (index !== -1) {
                console.log('✅ Updating local order state in cache')
                draft.data[index] = updatedOrder
              }
            }
          })
        )
      },
      new_order: (newOrder: any) => {
        console.log('🔔 SSE: Received new_order:', newOrder)
        dispatch(
          api.util.updateQueryData('getUserOrders' as any, userEmail, (draft: any) => {
            if (draft && draft.data) {
              if (!draft.data.some((o: any) => o.id === newOrder.id)) {
                console.log('✅ Adding new order to local cache')
                draft.data.unshift(newOrder)
              }
            }
          })
        )
      }
    }
  });

  const [copied, setCopied] = useState<string | null>(null)

  const orders = response?.data || []

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg border p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load orders. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-semibold">Your Exchange Orders</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary text-xs md:text-sm"
          onClick={() => router.push("/dashboard/orders")}
        >
          View All
        </Button>
      </div>

      <div className="space-y-3 md:space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-muted/30">
            <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No orders found</p>
            <p className="text-xs text-muted-foreground mt-1">Your recent transactions will appear here</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => router.push("/create-order")}
            >
              Start an Exchange
            </Button>
          </div>
        ) : (
          orders.map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.processing
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
                      <span className="font-mono text-xs md:text-sm font-medium">
                        {order.id.split('-')[0]}...{order.id.slice(-8)}
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
                    <div className="text-[10px] md:text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant={status.variant} className="flex items-center gap-1.5 text-[10px] md:text-xs">
                    <StatusIcon className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    {status.label}
                  </Badge>
                </div>

                {/* Exchange Details */}
                <div className="bg-muted rounded-lg p-3 md:p-4 mb-3 md:mb-4">
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <div className="text-[10px] md:text-xs text-muted-foreground mb-1">You send</div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          {order.fromCurrency?.flagUrl ? (
                            <div className="relative w-6 h-6 overflow-hidden rounded-full border border-muted-foreground/20">
                              <Image
                                src={order.fromCurrency.flagUrl}
                                alt={order.fromCurrency.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <span className="text-xl md:text-2xl">{order.fromCurrency?.flag || "💰"}</span>
                          )}
                          <div className="font-semibold text-sm md:text-base">
                            {(order.fromAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.fromCurrency?.code}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] md:text-xs text-muted-foreground mb-1">Recipient gets</div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          {order.toCurrency?.flagUrl ? (
                            <div className="relative w-6 h-6 overflow-hidden rounded-full border border-muted-foreground/20">
                              <Image
                                src={order.toCurrency.flagUrl}
                                alt={order.toCurrency.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <span className="text-xl md:text-2xl">{order.toCurrency?.flag || "💰"}</span>
                          )}
                          <div className="font-semibold text-sm md:text-base">
                            {(order.toAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.toCurrency?.code}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t text-[10px] md:text-xs text-muted-foreground">
                    Rate: 1 {order.fromCurrency?.code} = {(order.exchangeRate || 0).toFixed(2)} {order.toCurrency?.code}
                  </div>
                </div>

                {/* Destination */}
                <div className="mb-4">
                  <div className="text-[10px] md:text-xs text-muted-foreground mb-1">Recipient Info</div>
                  <div className="flex items-center gap-2 text-[11px] md:text-sm font-mono bg-muted p-2 rounded">
                    <span className="flex-1 truncate">
                      {order.recipientWalletAddress || `${order.recipientName} - ${order.recipientBank}`}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => copyToClipboard(order.recipientWalletAddress || order.recipientAccountNumber || "", `${order.id}-dest`)}
                    >
                      <Copy className={`w-3 h-3 ${copied === `${order.id}-dest` ? "text-green-600" : "text-muted-foreground"}`} />
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                {order.status === "pending_payment" && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 md:w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs md:text-sm font-medium mb-1">
                          Waiting for your payment
                        </div>
                        <div className="text-[10px] md:text-xs text-muted-foreground mb-3">
                          Send {(order.fromAmount || 0).toFixed(2)} {order.fromCurrency?.code} to our account to process this order
                        </div>
                        <Button
                          size="sm"
                          variant="default"
                          className="h-8 text-[11px] md:text-xs"
                          onClick={() => router.push(`/order-payment/${order.id}`)}
                        >
                          <ExternalLink className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          View Payment Details
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {order.status === "processing" && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                      <span className="text-[11px] md:text-sm">
                        Processing your exchange... Estimated completion in 2-24 hours
                      </span>
                    </div>
                  </div>
                )}

                {order.status === "completed" && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                      <span className="text-[11px] md:text-sm">
                        Successfully sent to destination account
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
