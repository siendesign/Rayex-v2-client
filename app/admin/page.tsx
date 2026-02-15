"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUpIcon,
  ClockIcon,
  DollarSignIcon,
  UsersIcon,
  ActivityIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XCircleIcon,
  Loader2,
} from "lucide-react"
import { useGetStatsQuery } from "@/state/api"
import { useSSE } from "@/hooks/useSSE"

export default function AdminDashboard() {
  const { data, isLoading, error, refetch } = useGetStatsQuery()

  // Real-time updates via SSE
  const sseUrl = `${process.env.NEXT_PUBLIC_API_URL}/realtime/sse?role=admin`;

  useSSE({
    url: sseUrl,
    events: {
      new_order: (order: any) => {
        console.log('📊 SSE: New order created, refreshing dashboard stats...', order.id)
        refetch()
      },
      order_updated: (order: any) => {
        console.log('📊 SSE: Order updated, refreshing dashboard stats...', order.id)
        refetch()
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <AlertCircleIcon className="size-8 text-destructive" />
        <p className="text-muted-foreground">Failed to load platform statistics</p>
      </div>
    )
  }

  const metrics = data?.data?.metrics || {}
  const recentOrdersData = data?.data?.recentOrders || []

  const stats = [
    {
      title: "Total Orders",
      value: metrics.totalOrders?.toLocaleString() || "0",
      change: "+0%", // Future: calculate from historical data
      trend: "up",
      icon: ActivityIcon,
    },
    {
      title: "Pending Orders",
      value: metrics.pendingOrders?.toLocaleString() || "0",
      change: "n/a",
      trend: "up",
      icon: ClockIcon,
    },
    {
      title: "Total Volume",
      value: `$${(metrics.totalVolume || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
      change: "+0%",
      trend: "up",
      icon: DollarSignIcon,
    },
    {
      title: "Active Users",
      value: metrics.activeUsers?.toLocaleString() || "0",
      change: "+0%",
      trend: "up",
      icon: UsersIcon,
    },
  ]

  // Recent orders mapping
  const recentOrders = recentOrdersData.map((order: any) => ({
    id: order.id,
    user: order.user?.name || "Unknown User",
    from: {
      currency: order.fromCurrency?.code || "???",
      amount: order.fromAmount?.toLocaleString()
    },
    to: {
      currency: order.toCurrency?.code || "???",
      amount: order.toAmount?.toLocaleString()
    },
    status: order.status,
    date: new Date(order.createdAt).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
  }))

  // Status breakdown
  const statusBreakdown = [
    { status: "Pending", count: metrics.pendingOrders || 0, color: "bg-yellow-500", icon: ClockIcon },
    { status: "Processing", count: 0, color: "bg-blue-500", icon: ActivityIcon }, // Simplified for now
    { status: "Completed", count: metrics.totalOrders - metrics.pendingOrders || 0, color: "bg-green-500", icon: CheckCircleIcon },
    { status: "Failed", count: 0, color: "bg-red-500", icon: XCircleIcon },
  ]

  // Performance metrics (Mocked for now as backend doesn't provide these)
  const performanceMetrics = [
    { label: "Total Platform Fees", value: `$${(metrics.totalFees || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` },
    { label: "Pending Verifications", value: metrics.pendingVerifications?.toString() || "0" },
    { label: "Success Rate", value: metrics.totalOrders > 0 ? `${(((metrics.totalOrders - metrics.pendingOrders) / metrics.totalOrders) * 100).toFixed(1)}%` : "100%" },
    { label: "Total Users", value: metrics.totalUsers?.toString() || "0" },
  ]

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
      completed: { variant: "default", className: "bg-green-500 hover:bg-green-600" },
      processing: { variant: "default", className: "bg-blue-500 hover:bg-blue-600" },
      pending_payment: { variant: "secondary", className: "bg-yellow-500 hover:bg-yellow-600 text-white" },
      failed: { variant: "destructive", className: "" },
    }

    const config = variants[status] || variants.pending_payment
    const displayStatus = status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

    return (
      <Badge variant={config.variant} className={config.className}>
        {displayStatus}
      </Badge>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Overview of platform activity and performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="size-3 md:size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                <p
                  className={`text-[10px] md:text-xs ${stat.trend === "up"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                    } flex items-center gap-0.5 md:gap-1 mt-1`}
                >
                  <TrendingUpIcon
                    className={`size-2.5 md:size-3 ${stat.trend === "down" ? "rotate-180" : ""
                      }`}
                  />
                  <span className="hidden sm:inline">{stat.change} from last month</span>
                  <span className="sm:hidden">{stat.change}</span>
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        {/* Recent Orders - Takes 2 columns */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              {recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 border-b border-border pb-3 md:pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm md:text-base">{order.id}</p>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {order.user}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">{order.date}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs md:text-sm font-medium">
                      {order.from.currency} {order.from.amount}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      → {order.to.currency} {order.to.amount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right column with Status Breakdown and Performance */}
        <div className="space-y-4 md:space-y-6">
          {/* Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statusBreakdown.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.status}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`size-2 rounded-full ${item.color}`} />
                        <span className="text-sm">{item.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.count}</span>
                        <Icon className="size-4 text-muted-foreground" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Platform Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performanceMetrics.map((metric) => (
                  <div key={metric.label} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {metric.label}
                      </span>
                      <span className="text-sm font-medium">{metric.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
