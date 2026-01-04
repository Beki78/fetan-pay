import { configureStore } from '@reduxjs/toolkit';
import { transactionsServiceApi } from './services/transactionsServiceApi';
import { merchantUsersServiceApi } from './services/merchantUsersServiceApi';
import { paymentsServiceApi } from './services/paymentsServiceApi';
import { paymentProvidersServiceApi } from './services/paymentProvidersServiceApi';

export const store = configureStore({
  reducer: {
    [transactionsServiceApi.reducerPath]: transactionsServiceApi.reducer,
    [merchantUsersServiceApi.reducerPath]: merchantUsersServiceApi.reducer,
    [paymentsServiceApi.reducerPath]: paymentsServiceApi.reducer,
    [paymentProvidersServiceApi.reducerPath]: paymentProvidersServiceApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      transactionsServiceApi.middleware,
      merchantUsersServiceApi.middleware,
      paymentsServiceApi.middleware,
      paymentProvidersServiceApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
