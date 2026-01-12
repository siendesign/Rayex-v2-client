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
} from "lucide-react"

export default function AdminDashboard() {
  // Mock data for stats
  const stats = [
    {
      title: "Total Orders",
      value: "1,234",
      change: "+12.5%",
      trend: "up",
      icon: ActivityIcon,
    },
    {
      title: "Pending Orders",
      value: "23",
      change: "-5.2%",
      trend: "down",
      icon: ClockIcon,
    },
    {
      title: "Total Volume",
      value: "$2.4M",
      change: "+18.3%",
      trend: "up",
      icon: DollarSignIcon,
    },
    {
      title: "Active Users",
      value: "892",
      change: "+8.1%",
      trend: "up",
      icon: UsersIcon,
    },
  ]

  // Mock recent orders
  const recentOrders = [
    {
      id: "ORD-2024-156",
      user: "John Smith",
      from: { currency: "USD", amount: "5,000" },
      to: { currency: "EUR", amount: "4,600" },
      status: "completed" as const,
      date: "2024-01-10 14:30",
    },
    {
      id: "ORD-2024-155",
      user: "Sarah Johnson",
      from: { currency: "GBP", amount: "2,500" },
      to: { currency: "USD", amount: "3,175" },
      status: "processing" as const,
      date: "2024-01-10 13:45",
    },
    {
      id: "ORD-2024-154",
      user: "Michael Chen",
      from: { currency: "EUR", amount: "10,000" },
      to: { currency: "JPY", amount: "1,620,000" },
      status: "pending_payment" as const,
      date: "2024-01-10 12:20",
    },
    {
      id: "ORD-2024-153",
      user: "Emma Wilson",
      from: { currency: "USD", amount: "7,500" },
      to: { currency: "GBP", amount: "5,925" },
      status: "completed" as const,
      date: "2024-01-10 11:15",
    },
    {
      id: "ORD-2024-152",
      user: "David Lee",
      from: { currency: "CAD", amount: "3,000" },
      to: { currency: "EUR", amount: "2,070" },
      status: "failed" as const,
      date: "2024-01-10 10:05",
    },
  ]

  // Status breakdown
  const statusBreakdown = [
    { status: "Pending", count: 23, color: "bg-yellow-500", icon: ClockIcon },
    { status: "Processing", count: 45, color: "bg-blue-500", icon: ActivityIcon },
    { status: "Completed", count: 1156, color: "bg-green-500", icon: CheckCircleIcon },
    { status: "Failed", count: 10, color: "bg-red-500", icon: XCircleIcon },
  ]

  // Performance metrics
  const performanceMetrics = [
    { label: "Average Processing Time", value: "2.3 hours" },
    { label: "Success Rate", value: "99.2%" },
    { label: "Customer Satisfaction", value: "4.8/5.0" },
    { label: "Response Time", value: "< 5 min" },
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
                  className={`text-[10px] md:text-xs ${
                    stat.trend === "up"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  } flex items-center gap-0.5 md:gap-1 mt-1`}
                >
                  <TrendingUpIcon
                    className={`size-2.5 md:size-3 ${
                      stat.trend === "down" ? "rotate-180" : ""
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
              {recentOrders.map((order) => (
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
