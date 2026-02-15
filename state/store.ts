/**
 * Alternative simple store setup
 * This file provides a simpler store configuration without the provider component
 * Use this if you prefer to set up the provider manually
 */

import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import globalReducer from "./index"
import { api } from "./api"

export const store = configureStore({
  reducer: {
    global: globalReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        ignoredPaths: ["global.nonSerializableData"],
      },
    }).concat(api.middleware),
})

// Setup listeners for refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch)

// Infer types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
