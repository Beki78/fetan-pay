import { configureStore } from '@reduxjs/toolkit';
import { transactionsServiceApi } from './services/transactionsServiceApi';

export const store = configureStore({
  reducer: {
    [transactionsServiceApi.reducerPath]: transactionsServiceApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(transactionsServiceApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
