# Redux Toolkit + RTK Query - Practical Examples

## Example 1: Admin Currencies Page with RTK Query

```tsx
"use client"

import { useState } from "react"
import {
  useGetCurrenciesQuery,
  useCreateCurrencyMutation,
  useUpdateCurrencyMutation,
  useDeleteCurrencyMutation,
  useToggleCurrencyActiveMutation,
} from "@/state/api"
import { useAppDispatch, useAppSelector } from "@/state/redux"
import { setSearch, setViewMode } from "@/state/index"

export default function CurrenciesPage() {
  const dispatch = useAppDispatch()

  // Global state
  const search = useAppSelector((state) => state.global.filters.search)
  const viewMode = useAppSelector((state) => state.global.ui.viewMode)

  // RTK Query
  const { data: currencies, isLoading, error } = useGetCurrenciesQuery()
  const [createCurrency, { isLoading: isCreating }] = useCreateCurrencyMutation()
  const [updateCurrency] = useUpdateCurrencyMutation()
  const [deleteCurrency] = useDeleteCurrencyMutation()
  const [toggleActive] = useToggleCurrencyActiveMutation()

  // Local state for dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCurrency, setEditingCurrency] = useState(null)

  // Filter currencies based on search
  const filteredCurrencies = currencies?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async (data) => {
    try {
      await createCurrency(data).unwrap()
      setIsDialogOpen(false)
      // Show success toast
    } catch (error) {
      // Show error toast
      console.error("Failed to create currency:", error)
    }
  }

  const handleUpdate = async (id, data) => {
    try {
      await updateCurrency({ id, data }).unwrap()
      setIsDialogOpen(false)
      setEditingCurrency(null)
    } catch (error) {
      console.error("Failed to update currency:", error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm("Are you sure?")) {
      try {
        await deleteCurrency(id).unwrap()
      } catch (error) {
        console.error("Failed to delete currency:", error)
      }
    }
  }

  const handleToggle = async (id) => {
    // Optimistic update - UI updates immediately
    await toggleActive(id)
  }

  if (isLoading) return <div>Loading currencies...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search currencies..."
          value={search}
          onChange={(e) => dispatch(setSearch(e.target.value))}
        />
        <button onClick={() => dispatch(setViewMode(viewMode === "grid" ? "list" : "grid"))}>
          Toggle View: {viewMode}
        </button>
        <button onClick={() => setIsDialogOpen(true)}>
          Add Currency
        </button>
      </div>

      <div className={viewMode === "grid" ? "grid" : "list"}>
        {filteredCurrencies?.map((currency) => (
          <div key={currency.id}>
            <h3>{currency.name} ({currency.code})</h3>
            <p>{currency.symbol}</p>
            <button onClick={() => handleToggle(currency.id)}>
              {currency.active ? "Active" : "Inactive"}
            </button>
            <button onClick={() => {
              setEditingCurrency(currency)
              setIsDialogOpen(true)
            }}>
              Edit
            </button>
            <button onClick={() => handleDelete(currency.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Dialog for create/edit */}
      {isDialogOpen && (
        <div>
          {/* Form here */}
        </div>
      )}
    </div>
  )
}
```

## Example 2: Orders Page with Pagination and Filters

```tsx
"use client"

import { useState } from "react"
import { useGetOrdersQuery, useUpdateOrderStatusMutation } from "@/state/api"
import { useAppDispatch, useAppSelector } from "@/state/redux"
import { setStatus, setDateRange, resetFilters } from "@/state/index"

export default function OrdersPage() {
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)

  // Global filters
  const status = useAppSelector((state) => state.global.filters.status)
  const dateRange = useAppSelector((state) => state.global.filters.dateRange)
  const search = useAppSelector((state) => state.global.filters.search)

  // RTK Query with filters
  const { data, isLoading, isFetching } = useGetOrdersQuery({
    page,
    limit: 10,
    search,
    status: status[0], // Single status for this example
    fromDate: dateRange.from,
    toDate: dateRange.to,
  })

  const [updateStatus] = useUpdateOrderStatusMutation()

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Optimistic update configured in API
      await updateStatus({ id: orderId, status: newStatus }).unwrap()
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const handleStatusFilterChange = (value) => {
    dispatch(setStatus([value]))
  }

  const handleDateRangeChange = (from, to) => {
    dispatch(setDateRange({ from, to }))
  }

  const handleResetFilters = () => {
    dispatch(resetFilters())
    setPage(1)
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          value={status[0] || ""}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending_payment">Pending Payment</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
        </select>

        <input
          type="date"
          value={dateRange.from || ""}
          onChange={(e) => handleDateRangeChange(e.target.value, dateRange.to)}
        />
        <input
          type="date"
          value={dateRange.to || ""}
          onChange={(e) => handleDateRangeChange(dateRange.from, e.target.value)}
        />

        <button onClick={handleResetFilters}>Reset Filters</button>
      </div>

      {/* Loading state */}
      {isLoading && <div>Loading orders...</div>}
      {isFetching && <div>Updating...</div>}

      {/* Orders table */}
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>From → To</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.fromCurrency} → {order.toCurrency}</td>
              <td>{order.fromAmount}</td>
              <td>{order.status}</td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  <option value="pending_payment">Pending Payment</option>
                  <option value="payment_received">Payment Received</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex gap-2 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
          Previous
        </button>
        <span>Page {data?.page} of {data?.totalPages}</span>
        <button
          disabled={page >= (data?.totalPages || 1)}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}
```

## Example 3: Dashboard with Stats and Multiple Queries

```tsx
"use client"

import {
  useGetStatsQuery,
  useGetOrdersQuery,
  useGetCurrenciesQuery,
} from "@/state/api"
import { useAppSelector } from "@/state/redux"

export default function DashboardPage() {
  // Multiple queries - automatically deduplicated and cached
  const { data: stats, isLoading: statsLoading } = useGetStatsQuery()
  const { data: recentOrders, isLoading: ordersLoading } = useGetOrdersQuery({
    page: 1,
    limit: 5,
    status: "pending_payment"
  })
  const { data: currencies } = useGetCurrenciesQuery()

  // Global state for user preferences
  const preferredCurrency = useAppSelector(
    (state) => state.global.userPreferences.currency
  )

  if (statsLoading || ordersLoading) {
    return <div>Loading dashboard...</div>
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <h3>Total Orders</h3>
          <p className="text-3xl">{stats?.totalOrders}</p>
        </div>
        <div className="card">
          <h3>Pending Orders</h3>
          <p className="text-3xl">{stats?.pendingOrders}</p>
        </div>
        <div className="card">
          <h3>Total Volume</h3>
          <p className="text-3xl">{preferredCurrency} {stats?.totalVolume}</p>
        </div>
        <div className="card">
          <h3>Active Users</h3>
          <p className="text-3xl">{stats?.activeUsers}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-8">
        <h2>Recent Orders</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>From → To</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders?.data.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.fromCurrency} → {order.toCurrency}</td>
                <td>{order.fromAmount}</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Active Currencies */}
      <div className="mt-8">
        <h2>Active Currencies</h2>
        <div className="flex gap-2">
          {currencies?.filter(c => c.active).map((currency) => (
            <span key={currency.id} className="badge">
              {currency.flag} {currency.code}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
```

## Example 4: Create Order Form with Global State

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  useGetCurrenciesQuery,
  useGetExchangeRatesQuery,
  useCreateOrderMutation,
} from "@/state/api"
import { useAppDispatch, useAppSelector } from "@/state/redux"
import { setCurrency } from "@/state/index"

export default function CreateOrderPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Global state for last used currency
  const lastUsedCurrency = useAppSelector(
    (state) => state.global.userPreferences.currency
  )

  // Local form state
  const [formData, setFormData] = useState({
    fromCurrency: lastUsedCurrency,
    fromAmount: "",
    toCurrency: "",
    paymentMethod: "",
  })

  // Queries
  const { data: currencies } = useGetCurrenciesQuery()
  const { data: rates } = useGetExchangeRatesQuery()
  const [createOrder, { isLoading }] = useCreateOrderMutation()

  // Calculate exchange
  const rate = rates?.find(
    (r) => r.fromCurrency === formData.fromCurrency &&
           r.toCurrency === formData.toCurrency
  )
  const toAmount = formData.fromAmount && rate
    ? parseFloat(formData.fromAmount) * rate.rate
    : 0

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const order = await createOrder({
        fromCurrency: formData.fromCurrency,
        fromAmount: parseFloat(formData.fromAmount),
        toCurrency: formData.toCurrency,
        toAmount,
        paymentMethod: formData.paymentMethod,
        rate: rate?.rate,
        fee: toAmount * 0.005, // 0.5% fee
        status: "pending_payment",
      }).unwrap()

      // Save preference
      dispatch(setCurrency(formData.fromCurrency))

      // Redirect to payment page
      router.push(`/order-payment/${order.id}`)
    } catch (error) {
      console.error("Failed to create order:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>From Currency</label>
        <select
          value={formData.fromCurrency}
          onChange={(e) => setFormData({ ...formData, fromCurrency: e.target.value })}
          required
        >
          <option value="">Select currency</option>
          {currencies?.filter(c => c.active).map((c) => (
            <option key={c.id} value={c.code}>
              {c.flag} {c.name} ({c.code})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Amount</label>
        <input
          type="number"
          value={formData.fromAmount}
          onChange={(e) => setFormData({ ...formData, fromAmount: e.target.value })}
          required
          min="1"
          step="0.01"
        />
      </div>

      <div>
        <label>To Currency</label>
        <select
          value={formData.toCurrency}
          onChange={(e) => setFormData({ ...formData, toCurrency: e.target.value })}
          required
        >
          <option value="">Select currency</option>
          {currencies?.filter(c => c.active).map((c) => (
            <option key={c.id} value={c.code}>
              {c.flag} {c.name} ({c.code})
            </option>
          ))}
        </select>
      </div>

      {rate && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>Exchange Rate: 1 {formData.fromCurrency} = {rate.rate} {formData.toCurrency}</p>
          <p>You will receive: {toAmount.toFixed(2)} {formData.toCurrency}</p>
          <p>Fee (0.5%): {(toAmount * 0.005).toFixed(2)} {formData.toCurrency}</p>
        </div>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Order"}
      </button>
    </form>
  )
}
```

## Example 5: Real-time Stats with Polling

```tsx
"use client"

import { useGetStatsQuery } from "@/state/api"
import { useAppDispatch, useAppSelector } from "@/state/redux"
import { toggleNotifications } from "@/state/index"

export default function LiveStats() {
  const dispatch = useAppDispatch()

  // User preference for notifications
  const notificationsEnabled = useAppSelector(
    (state) => state.global.userPreferences.notifications
  )

  // Poll every 30 seconds
  const { data: stats, isLoading, isFetching } = useGetStatsQuery(undefined, {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2>Live Statistics</h2>
        <div className="flex items-center gap-2">
          {isFetching && <span className="text-sm">Updating...</span>}
          <label>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={() => dispatch(toggleNotifications())}
            />
            Enable Notifications
          </label>
        </div>
      </div>

      {isLoading ? (
        <div>Loading stats...</div>
      ) : (
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="stat-card">
            <h3>Orders Today</h3>
            <p className="text-3xl">{stats?.ordersToday}</p>
            <span className="text-sm text-green-600">+{stats?.ordersTodayChange}%</span>
          </div>
          <div className="stat-card">
            <h3>Volume Today</h3>
            <p className="text-3xl">${stats?.volumeToday}</p>
            <span className="text-sm text-green-600">+{stats?.volumeTodayChange}%</span>
          </div>
          <div className="stat-card">
            <h3>Active Users</h3>
            <p className="text-3xl">{stats?.activeUsers}</p>
            <span className="text-sm">Online now</span>
          </div>
        </div>
      )}
    </div>
  )
}
```

## Example 6: Authentication Token Sync Component

```tsx
"use client"

import { useAuth } from "@clerk/nextjs"
import { useEffect } from "react"

/**
 * Add this component to your root layout to sync Clerk tokens
 * with RTK Query authentication
 */
export function AuthSync() {
  const { getToken, isLoaded } = useAuth()

  useEffect(() => {
    if (!isLoaded) return

    const syncToken = async () => {
      try {
        const token = await getToken()
        if (token) {
          localStorage.setItem("clerk_token", token)
        } else {
          localStorage.removeItem("clerk_token")
        }
      } catch (error) {
        console.error("Failed to sync auth token:", error)
      }
    }

    syncToken()

    // Refresh token every 5 minutes
    const interval = setInterval(syncToken, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [getToken, isLoaded])

  return null
}

// Add to layout.tsx:
// <ClerkProvider>
//   <StoreProvider>
//     <AuthSync />
//     {children}
//   </StoreProvider>
// </ClerkProvider>
```

## Example 7: Prefetching Data on Hover

```tsx
"use client"

import { useRouter } from "next/navigation"
import { useGetOrdersQuery } from "@/state/api"
import { api } from "@/state/api"
import { useAppDispatch } from "@/state/redux"

export function OrdersList() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { data: orders } = useGetOrdersQuery({ page: 1, limit: 10 })

  const handleHover = (orderId: string) => {
    // Prefetch order details on hover for instant navigation
    dispatch(api.util.prefetch("getOrder", orderId, { force: false }))
  }

  return (
    <div>
      {orders?.data.map((order) => (
        <div
          key={order.id}
          onMouseEnter={() => handleHover(order.id)}
          onClick={() => router.push(`/orders/${order.id}`)}
          className="cursor-pointer hover:bg-gray-100"
        >
          {order.id} - {order.status}
        </div>
      ))}
    </div>
  )
}
```

These examples demonstrate real-world usage patterns combining Redux Toolkit global state management with RTK Query for API data fetching in a Next.js App Router application.
