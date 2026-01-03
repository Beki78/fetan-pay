import { configureStore } from '@reduxjs/toolkit'
import { verifierApi } from './api'

export const store = configureStore({
  reducer: {
    [verifierApi.reducerPath]: verifierApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(verifierApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
