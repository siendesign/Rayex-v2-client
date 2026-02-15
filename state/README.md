# Redux Toolkit + RTK Query Setup Guide

Complete Redux Toolkit implementation with RTK Query for Next.js 14+ App Router.

## 📁 Architecture

```
state/
├── redux.tsx          # Store provider component (client-side)
├── store.ts           # Alternative simple store setup
├── index.ts           # Global slice with reducers
├── api.ts             # RTK Query API definitions
└── README.md          # This file
```

## 🚀 Quick Start

### 1. State is already integrated in the app

The `StoreProvider` is wrapped around the entire app in `app/layout.tsx`:

```tsx
<ClerkProvider>
  <StoreProvider>
    {children}
  </StoreProvider>
</ClerkProvider>
```

### 2. Using Global State in Components

```tsx
"use client"

import { useAppDispatch, useAppSelector } from "@/state/redux"
import { setSearch, toggleSidebar, setCurrency } from "@/state/index"

export function MyComponent() {
  const dispatch = useAppDispatch()

  // Read state
  const search = useAppSelector((state) => state.global.filters.search)
  const isSidebarOpen = useAppSelector((state) => state.global.ui.isSidebarOpen)

  // Dispatch actions
  const handleSearch = (value: string) => {
    dispatch(setSearch(value))
  }

  const handleToggle = () => {
    dispatch(toggleSidebar())
  }

  return (
    <div>
      <input value={search} onChange={(e) => handleSearch(e.target.value)} />
      <button onClick={handleToggle}>Toggle Sidebar</button>
    </div>
  )
}
```

### 3. Using RTK Query for API Calls

```tsx
"use client"

import {
  useGetCurrenciesQuery,
  useCreateCurrencyMutation,
  useToggleCurrencyActiveMutation
} from "@/state/api"

export function CurrencyList() {
  // Query - automatically fetches data
  const { data: currencies, isLoading, error } = useGetCurrenciesQuery()

  // Mutations
  const [createCurrency, { isLoading: isCreating }] = useCreateCurrencyMutation()
  const [toggleActive] = useToggleCurrencyActiveMutation()

  const handleCreate = async () => {
    try {
      await createCurrency({
        code: "EUR",
        name: "Euro",
        symbol: "€",
        type: "fiat"
      }).unwrap()
      // Success - cache automatically updated
    } catch (error) {
      console.error("Failed to create currency:", error)
    }
  }

  const handleToggle = async (id: string) => {
    await toggleActive(id) // Optimistic update enabled
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading currencies</div>

  return (
    <div>
      {currencies?.map((currency) => (
        <div key={currency.id}>
          {currency.name}
          <button onClick={() => handleToggle(currency.id)}>
            {currency.active ? "Deactivate" : "Activate"}
          </button>
        </div>
      ))}
    </div>
  )
}
```

## 📦 Available State & Actions

### Global State Structure

```typescript
{
  global: {
    filters: {
      search: string
      status: string[]
      dateRange: { from: string | null, to: string | null }
      sortBy: string
      sortOrder: "asc" | "desc"
    },
    ui: {
      isSidebarOpen: boolean
      viewMode: "grid" | "list"
      activeModal: string | null
      theme: "light" | "dark" | "system"
    },
    userPreferences: {
      currency: string
      language: string
      notifications: boolean
      emailAlerts: boolean
    },
    selectedItems: string[]
    isLoading: boolean
  }
}
```

### Global Actions

**Filters:**
- `setSearch(search: string)`
- `setStatus(status: string[])`
- `setDateRange({ from, to })`
- `setSortBy(sortBy: string)`
- `setSortOrder(order: "asc" | "desc")`
- `resetFilters()`
- `updateFilters(partial: Partial<FilterState>)`

**UI:**
- `toggleSidebar()`
- `setSidebarOpen(open: boolean)`
- `setViewMode(mode: "grid" | "list")`
- `setActiveModal(modal: string | null)`
- `setTheme(theme: "light" | "dark" | "system")`
- `updateUI(partial: Partial<UIState>)`

**User Preferences:**
- `setCurrency(currency: string)`
- `setLanguage(language: string)`
- `toggleNotifications()`
- `toggleEmailAlerts()`
- `updateUserPreferences(partial: Partial<UserPreferences>)`

**Selection:**
- `setSelectedItems(items: string[])`
- `toggleItemSelection(id: string)`
- `clearSelection()`

**Utility:**
- `setLoading(loading: boolean)`
- `resetGlobalState()`

## 🔌 RTK Query Endpoints

### Currencies
- `useGetCurrenciesQuery()` - Get all currencies
- `useGetCurrencyQuery(id)` - Get single currency
- `useCreateCurrencyMutation()` - Create currency
- `useUpdateCurrencyMutation()` - Update currency
- `useDeleteCurrencyMutation()` - Delete currency
- `useToggleCurrencyActiveMutation()` - Toggle active status (optimistic)

### Exchange Rates
- `useGetExchangeRatesQuery()` - Get all rates
- `useGetExchangeRateQuery(id)` - Get single rate
- `useCreateExchangeRateMutation()` - Create rate
- `useUpdateExchangeRateMutation()` - Update rate
- `useRefreshExchangeRateMutation()` - Refresh single rate
- `useRefreshAllExchangeRatesMutation()` - Refresh all rates

### Payment Methods
- `useGetPaymentMethodsQuery()` - Get all payment methods
- `useGetPaymentMethodQuery(id)` - Get single payment method
- `useCreatePaymentMethodMutation()` - Create payment method
- `useUpdatePaymentMethodMutation()` - Update payment method
- `useDeletePaymentMethodMutation()` - Delete payment method

### Orders
- `useGetOrdersQuery(filters)` - Get paginated orders with filters
- `useGetOrderQuery(id)` - Get single order
- `useCreateOrderMutation()` - Create order
- `useUpdateOrderStatusMutation()` - Update order status (optimistic)

### Users
- `useGetUsersQuery(filters)` - Get paginated users with filters
- `useGetUserQuery(id)` - Get single user
- `useUpdateUserStatusMutation()` - Update user status

### Stats
- `useGetStatsQuery()` - Get dashboard statistics

## 🎯 Advanced Patterns

### 1. Paginated Data with Filters

```tsx
const [filters, setFilters] = useState({
  page: 1,
  limit: 10,
  search: "",
  status: "active"
})

const { data, isLoading } = useGetOrdersQuery(filters)

// data contains: { data: Order[], total, page, limit, totalPages }
```

### 2. Optimistic Updates

Optimistic updates are already configured for:
- `toggleCurrencyActive` - Toggle currency active status
- `updateOrderStatus` - Update order status

These mutations update the UI immediately and roll back on error.

### 3. Manual Cache Invalidation

```tsx
import { api } from "@/state/api"

// In a component
const dispatch = useAppDispatch()

// Invalidate specific tags
dispatch(api.util.invalidateTags([{ type: "Orders", id: "LIST" }]))

// Reset entire API state
dispatch(api.util.resetApiState())
```

### 4. Prefetching Data

```tsx
import { api } from "@/state/api"

// In a component
const dispatch = useAppDispatch()

// Prefetch on hover
const handleHover = () => {
  dispatch(api.util.prefetch("getCurrency", "currency-id", { force: false }))
}
```

### 5. Conditional Queries

```tsx
// Skip query if no ID
const { data } = useGetOrderQuery(orderId, {
  skip: !orderId
})

// Polling every 30 seconds
const { data } = useGetStatsQuery(undefined, {
  pollingInterval: 30000
})

// Refetch on window focus
const { data } = useGetOrdersQuery(filters, {
  refetchOnFocus: true,
  refetchOnReconnect: true
})
```

### 6. Combining State Sources

```tsx
const dispatch = useAppDispatch()

// Global state
const search = useAppSelector(state => state.global.filters.search)
const sortBy = useAppSelector(state => state.global.filters.sortBy)

// API data with global filters
const { data } = useGetOrdersQuery({
  search,
  sortBy,
  page: 1,
  limit: 10
})

// Update global state
const handleSearchChange = (value: string) => {
  dispatch(setSearch(value))
  // Query automatically refetches due to changed params
}
```

## 🔒 Authentication

The API base query automatically includes Clerk authentication tokens:

```typescript
// In state/api.ts - prepareHeaders
prepareHeaders: async (headers) => {
  const token = localStorage.getItem("clerk_token")
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  return headers
}
```

To integrate with Clerk in client components:

```tsx
"use client"

import { useAuth } from "@clerk/nextjs"
import { useEffect } from "react"

export function AuthSync() {
  const { getToken } = useAuth()

  useEffect(() => {
    const syncToken = async () => {
      const token = await getToken()
      if (token) {
        localStorage.setItem("clerk_token", token)
      }
    }
    syncToken()
  }, [getToken])

  return null
}
```

Add `<AuthSync />` to your layout to keep tokens in sync.

## 🎨 TypeScript Support

All hooks are fully typed:

```typescript
import type { RootState, AppDispatch } from "@/state/redux"
import type { Currency, Order, User } from "@/state/api"

// State selector with full autocomplete
const value = useAppSelector((state: RootState) => state.global.filters.search)

// Typed dispatch
const dispatch = useAppDispatch()

// Mutation with typed response
const [createCurrency] = useCreateCurrencyMutation()
const result: Currency = await createCurrency(data).unwrap()
```

## 📊 DevTools

Redux DevTools are automatically enabled in development mode. Install the browser extension:
- [Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

## 🧪 Testing

```typescript
// Mock store for testing
import { makeStore } from "@/state/redux"

const store = makeStore()
const state = store.getState()
```

## 🚨 Error Handling

RTK Query automatically handles errors. Access them in components:

```tsx
const { data, error, isError } = useGetOrdersQuery()

if (isError) {
  console.error("API Error:", error)
  // error.status - HTTP status code
  // error.data - Error response body
}
```

## ⚡ Performance

- **Automatic Caching**: All queries are cached by default (60 seconds)
- **Deduplication**: Multiple components using the same query share one request
- **Optimistic Updates**: Configured for toggle and status mutations
- **Selective Invalidation**: Only relevant cache entries are invalidated
- **Lazy Loading**: Only fetch when component mounts

## 📝 Environment Variables

Set in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3003/api
```

## 🔄 Cache Configuration

Default settings in `state/api.ts`:

```typescript
// Customize per endpoint
getCurrencies: build.query({
  keepUnusedDataFor: 60, // seconds
  // ... other options
})
```

## 🎯 Best Practices

1. **Use global state for UI/filters**, RTK Query for server data
2. **Always use typed hooks** (`useAppDispatch`, `useAppSelector`)
3. **Destructure only needed values** from selectors for performance
4. **Use `skip` option** to conditionally fetch data
5. **Implement optimistic updates** for instant feedback
6. **Tag your cache** properly for accurate invalidation
7. **Handle loading/error states** in all components using queries

## 🆘 Common Issues

### Query not refetching?
Check that params are properly serialized and tags are configured.

### State not updating?
Ensure component is using `useAppSelector` and state path is correct.

### Authentication failing?
Verify token is stored in localStorage and base URL is correct.

### TypeScript errors?
Import types from `@/state/redux` and `@/state/api`.
