import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { currentUser } from "@clerk/nextjs/server"

// API_VERSION: 1.0.1

// Type definitions for API responses
export interface BaseResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  flag: string
  flagUrl?: string
  type: "fiat" | "crypto"
  decimals: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ExchangeRate {
  id: string
  fromCurrencyId: string
  toCurrencyId: string
  fromCurrency: Currency
  toCurrency: Currency
  rate: number
  previousRate?: number | null
  buyRate: number
  sellRate: number
  lastUpdated: string
  autoUpdate: boolean
  active: boolean
}

export interface CreateExchangeRateRequest {
  fromCurrencyId: string
  toCurrencyId: string
  rate: number
  buyRate?: number
  sellRate?: number
  autoUpdate?: boolean
  active?: boolean
}

export interface UpdateExchangeRateRequest {
  rate?: number
  buyRate?: number
  sellRate?: number
  autoUpdate?: boolean
  active?: boolean
  fromCurrencyId?: string
  toCurrencyId?: string
}

export interface PaymentMethod {
  id: string
  name: string
  type: "bank" | "crypto"
  currencyId: string
  currency: Currency
  active: boolean
  bankName?: string
  accountName?: string
  accountNumber?: string
  routingNumber?: string
  swift?: string
  iban?: string
  walletAddress?: string
  network?: string
  instructions?: string
}

export interface Order {
  id: string
  userId: string
  fromCurrencyId: string
  fromCurrency: Currency
  fromAmount: number
  toCurrencyId: string
  toCurrency: Currency
  toAmount: number
  status: "pending_payment" | "payment_received" | "processing" | "completed" | "failed" | "cancelled"
  paymentMethodId: string
  paymentMethod: PaymentMethod
  exchangeRate: number
  fee: number
  recipientName?: string
  recipientBank?: string
  recipientAccountNumber?: string
  recipientSwift?: string
  recipientWalletAddress?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateOrderRequest {
  userEmail: string
  fromCurrencyId: string
  fromAmount: number
  toCurrencyId: string
  toAmount: number
  paymentMethodId: string
  recipientName?: string
  recipientBank?: string
  recipientAccountNumber?: string
  recipientSwift?: string
  recipientWalletAddress?: string
  exchangeRate: number
  notes?: string
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  status: "active" | "suspended" | "pending"
  role: "user" | "admin"
  totalOrders: number
  totalVolume: number
  verificationStatus: "verified" | "unverified" | "pending"
  joinedAt: string
  lastActive: string
}

// Pagination types
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> extends BaseResponse<T[]> {
  pagination: PaginationInfo
}

// Filter types
export interface OrderFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  fromDate?: string
  toDate?: string
}

export interface UserFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  role?: string
}

// Helper to clean undefined params
const cleanParams = (params: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== "")
  )
}

// Create API slice
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003/api",
    prepareHeaders: async (headers) => {
      try {
        // Get Clerk token for authentication
        // Note: This is a server-side function, in client components
        // you would use const { getToken } = useAuth() from @clerk/nextjs
        // For now, we'll handle this in the client components
        const token = typeof window !== "undefined"
          ? localStorage.getItem("clerk_token")
          : null

        if (token) {
          headers.set("Authorization", `Bearer ${token}`)
        }
      } catch (error) {
        console.error("Error getting auth token:", error)
      }
      return headers
    },
  }),
  tagTypes: [
    "Currencies",
    "ExchangeRates",
    "PaymentMethods",
    "Orders",
    "Users",
    "Stats"
  ],
  endpoints: (build) => ({
    // ============ CURRENCIES ============
    getCurrencies: build.query<BaseResponse<Currency[]>, void>({
      query: () => "currencies",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Currencies" as const, id })),
              { type: "Currencies", id: "LIST" },
            ]
          : [{ type: "Currencies", id: "LIST" }],
    }),

    getCurrency: build.query<BaseResponse<Currency>, string>({
      query: (id) => `currencies/${id}`,
      providesTags: (result, error, id) => [{ type: "Currencies", id }],
    }),

    createCurrency: build.mutation<BaseResponse<Currency>, FormData | Partial<Currency>>({
      query: (body) => ({
        url: "currencies",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Currencies", id: "LIST" }],
    }),

    updateCurrency: build.mutation<BaseResponse<Currency>, { id: string; data: FormData | Partial<Currency> }>({
      query: ({ id, data }) => ({
        url: `currencies/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Currencies", id },
        { type: "Currencies", id: "LIST" },
      ],
    }),

    deleteCurrency: build.mutation<BaseResponse<void>, string>({
      query: (id) => ({
        url: `currencies/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Currencies", id: "LIST" }],
    }),

    toggleCurrencyActive: build.mutation<BaseResponse<Currency>, string>({
      query: (id) => ({
        url: `currencies/${id}/toggle`,
        method: "POST",
      }),
      // Optimistic update
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          api.util.updateQueryData("getCurrencies", undefined, (draft) => {
            if (draft?.data) {
              const currency = draft.data.find((c) => c.id === id)
              if (currency) {
                currency.active = !currency.active
              }
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
      invalidatesTags: (result, error, id) => [{ type: "Currencies", id }],
    }),

    // ============ EXCHANGE RATES ============
    getExchangeRates: build.query<BaseResponse<ExchangeRate[]>, void>({
      query: () => "exchange-rates",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "ExchangeRates" as const, id })),
              { type: "ExchangeRates", id: "LIST" },
            ]
          : [{ type: "ExchangeRates", id: "LIST" }],
    }),

    getExchangeRate: build.query<BaseResponse<ExchangeRate>, string>({
      query: (id) => `exchange-rates/${id}`,
      providesTags: (result, error, id) => [{ type: "ExchangeRates", id }],
    }),

    createExchangeRate: build.mutation<BaseResponse<ExchangeRate>, CreateExchangeRateRequest>({
      query: (body) => ({
        url: "exchange-rates",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ExchangeRates", id: "LIST" }],
    }),

    updateExchangeRate: build.mutation<BaseResponse<ExchangeRate>, { id: string; data: UpdateExchangeRateRequest }>({
      query: ({ id, data }) => ({
        url: `exchange-rates/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ExchangeRates", id },
        { type: "ExchangeRates", id: "LIST" },
      ],
    }),

    refreshExchangeRate: build.mutation<BaseResponse<ExchangeRate>, string>({
      query: (id) => ({
        url: `exchange-rates/${id}/refresh`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "ExchangeRates", id },
        { type: "ExchangeRates", id: "LIST" },
      ],
    }),

    refreshAllExchangeRates: build.mutation<void, void>({
      query: () => ({
        url: "exchange-rates/refresh-all",
        method: "POST",
      }),
      invalidatesTags: [{ type: "ExchangeRates", id: "LIST" }],
    }),

    // ============ PAYMENT METHODS ============
    getPaymentMethods: build.query<BaseResponse<PaymentMethod[]>, void>({
      query: () => "payment-methods",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "PaymentMethods" as const, id })),
              { type: "PaymentMethods", id: "LIST" },
            ]
          : [{ type: "PaymentMethods", id: "LIST" }],
    }),

    getPaymentMethod: build.query<BaseResponse<PaymentMethod>, string>({
      query: (id) => `payment-methods/${id}`,
      providesTags: (result, error, id) => [{ type: "PaymentMethods", id }],
    }),

    createPaymentMethod: build.mutation<BaseResponse<PaymentMethod>, Partial<PaymentMethod>>({
      query: (body) => ({
        url: "payment-methods",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "PaymentMethods", id: "LIST" }],
    }),

    updatePaymentMethod: build.mutation<BaseResponse<PaymentMethod>, { id: string; data: Partial<PaymentMethod> }>({
      query: ({ id, data }) => ({
        url: `payment-methods/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PaymentMethods", id },
        { type: "PaymentMethods", id: "LIST" },
      ],
    }),

    deletePaymentMethod: build.mutation<BaseResponse<void>, string>({
      query: (id) => ({
        url: `payment-methods/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "PaymentMethods", id: "LIST" }],
    }),

    // ============ ORDERS ============
    getOrders: build.query<PaginatedResponse<Order>, OrderFilters>({
      query: (params) => ({
        url: "orders",
        params: cleanParams(params),
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Orders" as const, id })),
              { type: "Orders", id: "LIST" },
            ]
          : [{ type: "Orders", id: "LIST" }],
    }),

    getUserOrders: build.query<BaseResponse<Order[]>, string>({
      query: (email) => `orders/by-user?email=${email}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Orders" as const, id })),
              { type: "Orders", id: "LIST" },
            ]
          : [{ type: "Orders", id: "LIST" }],
    }),

    getOrder: build.query<BaseResponse<Order>, string>({
      query: (id) => `orders/${id}`,
      providesTags: (result, error, id) => [{ type: "Orders", id }],
    }),

    createOrder: build.mutation<BaseResponse<Order>, CreateOrderRequest>({
      query: (body) => ({
        url: "orders",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Orders", id: "LIST" },
        { type: "Stats", id: "LIST" },
      ],
    }),

    updateOrderStatus: build.mutation<BaseResponse<Order>, { id: string; status: Order["status"]; notes?: string }>({
      query: ({ id, status, notes }) => ({
        url: `orders/${id}/status`,
        method: "PUT",
        body: { status, notes },
      }),
      // Optimistic update
      onQueryStarted: async ({ id, status }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          api.util.updateQueryData("getOrder", id, (draft) => {
            if (draft?.data) {
              draft.data.status = status
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Orders", id },
        { type: "Orders", id: "LIST" },
        { type: "Stats", id: "LIST" },
      ],
    }),

    // ============ USERS ============
    getUsers: build.query<PaginatedResponse<User>, UserFilters>({
      query: (params) => ({
        url: "users",
        params: cleanParams(params),
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Users" as const, id })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    getUser: build.query<BaseResponse<User>, string>({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: "Users", id }],
    }),

    updateUserStatus: build.mutation<BaseResponse<User>, { id: string; status: User["status"] }>({
      query: ({ id, status }) => ({
        url: `users/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),

    // Sync user from Clerk to database
    syncUser: build.mutation<BaseResponse<User>, {
      clerkId: string
      name: string
      email: string
      phone?: string
      role: string
      metadata?: Record<string, any>
    }>({
      query: (body) => ({
        url: "users/sync",
        method: "POST",
        body,
      }),
      invalidatesTags: (result) =>
        result?.data ? [{ type: "Users", id: result.data.id }] : [],
    }),

    // ============ ADMIN ACTIONS ============
    suspendUser: build.mutation<BaseResponse<User>, string>({
      query: (id) => ({
        url: `admin/users/${id}/suspend`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
        { type: "Stats", id: "LIST" },
      ],
    }),

    activateUser: build.mutation<BaseResponse<User>, string>({
      query: (id) => ({
        url: `admin/users/${id}/activate`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
        { type: "Stats", id: "LIST" },
      ],
    }),

    updateUserRole: build.mutation<BaseResponse<User>, { id: string; role: "user" | "admin" }>({
      query: ({ id, role }) => ({
        url: `admin/users/${id}/role`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),

    deleteUser: build.mutation<void, string>({
      query: (id) => ({
        url: `admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Users", id: "LIST" },
        { type: "Stats", id: "LIST" },
      ],
    }),

    // ============ STATS ============
    getStats: build.query<any, void>({
      query: () => "stats",
      providesTags: [{ type: "Stats", id: "LIST" }],
    }),
  }),
})

// Export hooks for usage in components
export const {
  // Currencies
  useGetCurrenciesQuery,
  useGetCurrencyQuery,
  useCreateCurrencyMutation,
  useUpdateCurrencyMutation,
  useDeleteCurrencyMutation,
  useToggleCurrencyActiveMutation,

  // Exchange Rates
  useGetExchangeRatesQuery,
  useGetExchangeRateQuery,
  useCreateExchangeRateMutation,
  useUpdateExchangeRateMutation,
  useRefreshExchangeRateMutation,
  useRefreshAllExchangeRatesMutation,

  // Payment Methods
  useGetPaymentMethodsQuery,
  useGetPaymentMethodQuery,
  useCreatePaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,

  // Orders
  useGetOrdersQuery,
  useGetUserOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,

  // Users
  useGetUsersQuery,
  useGetUserQuery,
  useUpdateUserStatusMutation,
  useSyncUserMutation,

  // Admin Actions
  useSuspendUserMutation,
  useActivateUserMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,

  // Stats
  useGetStatsQuery,
} = api
