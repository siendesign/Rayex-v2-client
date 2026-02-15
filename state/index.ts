import { createSlice, PayloadAction } from "@reduxjs/toolkit"

// Type definitions for state shape
export interface FilterState {
  search: string
  status: string[]
  dateRange: {
    from: string | null
    to: string | null
  }
  sortBy: string
  sortOrder: "asc" | "desc"
}

export interface UIState {
  isSidebarOpen: boolean
  viewMode: "grid" | "list"
  activeModal: string | null
  theme: "light" | "dark" | "system"
}

export interface UserPreferences {
  currency: string
  language: string
  notifications: boolean
  emailAlerts: boolean
}

export interface AuthUser {
  id: string | null
  name: string | null
  email: string | null
  role: "user" | "admin" | null
}

export interface GlobalState {
  user: AuthUser
  filters: FilterState
  ui: UIState
  userPreferences: UserPreferences
  selectedItems: string[]
  isLoading: boolean
}

// Initial state with sensible defaults
const initialState: GlobalState = {
  user: {
    id: null,
    name: null,
    email: null,
    role: null,
  },
  filters: {
    search: "",
    status: [],
    dateRange: {
      from: null,
      to: null,
    },
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  ui: {
    isSidebarOpen: true,
    viewMode: "list",
    activeModal: null,
    theme: "system",
  },
  userPreferences: {
    currency: "USD",
    language: "en",
    notifications: true,
    emailAlerts: true,
  },
  selectedItems: [],
  isLoading: false,
}

// Create the global slice
export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    // User/Auth reducers
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload
    },
    clearUser: (state) => {
      state.user = initialState.user
    },
    updateUserRole: (state, action: PayloadAction<"user" | "admin">) => {
      if (state.user.id) {
        state.user.role = action.payload
      }
    },

    // Filter reducers
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload
    },
    setStatus: (state, action: PayloadAction<string[]>) => {
      state.filters.status = action.payload
    },
    setDateRange: (
      state,
      action: PayloadAction<{ from: string | null; to: string | null }>
    ) => {
      state.filters.dateRange = action.payload
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.filters.sortBy = action.payload
    },
    setSortOrder: (state, action: PayloadAction<"asc" | "desc">) => {
      state.filters.sortOrder = action.payload
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
    },
    updateFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },

    // UI reducers
    toggleSidebar: (state) => {
      state.ui.isSidebarOpen = !state.ui.isSidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.isSidebarOpen = action.payload
    },
    setViewMode: (state, action: PayloadAction<"grid" | "list">) => {
      state.ui.viewMode = action.payload
    },
    setActiveModal: (state, action: PayloadAction<string | null>) => {
      state.ui.activeModal = action.payload
    },
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
      state.ui.theme = action.payload
    },
    updateUI: (state, action: PayloadAction<Partial<UIState>>) => {
      state.ui = { ...state.ui, ...action.payload }
    },

    // User preferences reducers
    setCurrency: (state, action: PayloadAction<string>) => {
      state.userPreferences.currency = action.payload
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.userPreferences.language = action.payload
    },
    toggleNotifications: (state) => {
      state.userPreferences.notifications = !state.userPreferences.notifications
    },
    toggleEmailAlerts: (state) => {
      state.userPreferences.emailAlerts = !state.userPreferences.emailAlerts
    },
    updateUserPreferences: (
      state,
      action: PayloadAction<Partial<UserPreferences>>
    ) => {
      state.userPreferences = { ...state.userPreferences, ...action.payload }
    },

    // Selection reducers
    setSelectedItems: (state, action: PayloadAction<string[]>) => {
      state.selectedItems = action.payload
    },
    toggleItemSelection: (state, action: PayloadAction<string>) => {
      const index = state.selectedItems.indexOf(action.payload)
      if (index > -1) {
        state.selectedItems.splice(index, 1)
      } else {
        state.selectedItems.push(action.payload)
      }
    },
    clearSelection: (state) => {
      state.selectedItems = []
    },

    // Loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    // Reset entire state
    resetGlobalState: () => initialState,
  },
})

// Export actions
export const {
  setUser,
  clearUser,
  updateUserRole,
  setSearch,
  setStatus,
  setDateRange,
  setSortBy,
  setSortOrder,
  resetFilters,
  updateFilters,
  toggleSidebar,
  setSidebarOpen,
  setViewMode,
  setActiveModal,
  setTheme,
  updateUI,
  setCurrency,
  setLanguage,
  toggleNotifications,
  toggleEmailAlerts,
  updateUserPreferences,
  setSelectedItems,
  toggleItemSelection,
  clearSelection,
  setLoading,
  resetGlobalState,
} = globalSlice.actions

// Export reducer
export default globalSlice.reducer
