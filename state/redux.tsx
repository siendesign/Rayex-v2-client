"use client"

import { useRef } from "react"
import { Provider } from "react-redux"
import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux"
import globalReducer from "./index"
import { api } from "./api"

// Combine all reducers
const rootReducer = combineReducers({
  global: globalReducer,
  [api.reducerPath]: api.reducer,
})

// Create store with middleware
export const makeStore = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types for serialization check
          ignoredActions: [
            "persist/PERSIST",
            "persist/REHYDRATE",
          ],
          // Ignore these paths in the state
          ignoredPaths: ["global.nonSerializableData"],
        },
      }).concat(api.middleware),
  })

  // Setup listeners for refetchOnFocus/refetchOnReconnect
  setupListeners(store.dispatch)

  return store
}

// Infer types from the store
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Store Provider Component
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore | null>(null)

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}
