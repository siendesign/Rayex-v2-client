import { DashboardNav } from "@/components/dashboard-nav"
import { CreateOrderCard } from "@/components/dashboard/create-order-card"
import { ActiveOrders } from "@/components/dashboard/active-orders"
import { QuickExchange } from "@/components/dashboard/quick-exchange"
import { LiveRates } from "@/components/dashboard/live-rates"
import { Card, CardContent } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8">
        {/* Welcome Section */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Welcome back, John!</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage your exchange orders and track real-time rates.</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1  lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <CreateOrderCard />
            <ActiveOrders />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-4 md:space-y-6">
            <QuickExchange />
            <LiveRates />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-4 md:mt-6">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="text-xs md:text-sm text-muted-foreground mb-1">Total Orders</div>
              <div className="text-xl md:text-2xl font-bold mb-1 md:mb-2">247</div>
              <div className="text-xs md:text-sm text-green-600">+12 this month</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="text-xs md:text-sm text-muted-foreground mb-1">Total Exchanged</div>
              <div className="text-xl md:text-2xl font-bold mb-1 md:mb-2">$128,450</div>
              <div className="text-xs md:text-sm text-green-600">All time</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="text-xs md:text-sm text-muted-foreground mb-1">Saved on Fees</div>
              <div className="text-xl md:text-2xl font-bold mb-1 md:mb-2">$2,340</div>
              <div className="text-xs md:text-sm text-muted-foreground">vs banks</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="text-xs md:text-sm text-muted-foreground mb-1">Active Orders</div>
              <div className="text-xl md:text-2xl font-bold mb-1 md:mb-2">2</div>
              <div className="text-xs md:text-sm text-yellow-600">Pending payment</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
