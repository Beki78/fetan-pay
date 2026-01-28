import { configureStore } from '@reduxjs/toolkit';
import { transactionsServiceApi } from './services/transactionsServiceApi';
import { merchantUsersServiceApi } from './services/merchantUsersServiceApi';
import { paymentsServiceApi } from './services/paymentsServiceApi';
import { paymentProvidersServiceApi } from './services/paymentProvidersServiceApi';
import { brandingServiceApi } from './services/brandingServiceApi';
import { dashboardServiceApi } from './services/dashboardServiceApi';
import { walletServiceApi } from './services/walletServiceApi';
import { apiKeysServiceApi } from './services/apiKeysServiceApi';
import { webhooksServiceApi } from './services/webhooksServiceApi';
import { notificationsServiceApi } from './services/notificationsServiceApi';
import { ipAddressesServiceApi } from './services/ipAddressesServiceApi';

export const store = configureStore({
  reducer: {
    [transactionsServiceApi.reducerPath]: transactionsServiceApi.reducer,
    [merchantUsersServiceApi.reducerPath]: merchantUsersServiceApi.reducer,
    [paymentsServiceApi.reducerPath]: paymentsServiceApi.reducer,
    [paymentProvidersServiceApi.reducerPath]: paymentProvidersServiceApi.reducer,
    [brandingServiceApi.reducerPath]: brandingServiceApi.reducer,
    [dashboardServiceApi.reducerPath]: dashboardServiceApi.reducer,
    [walletServiceApi.reducerPath]: walletServiceApi.reducer,
    [apiKeysServiceApi.reducerPath]: apiKeysServiceApi.reducer,
    [webhooksServiceApi.reducerPath]: webhooksServiceApi.reducer,
    [notificationsServiceApi.reducerPath]: notificationsServiceApi.reducer,
    [ipAddressesServiceApi.reducerPath]: ipAddressesServiceApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      transactionsServiceApi.middleware,
      merchantUsersServiceApi.middleware,
      paymentsServiceApi.middleware,
      paymentProvidersServiceApi.middleware,
      brandingServiceApi.middleware,
      dashboardServiceApi.middleware,
      walletServiceApi.middleware,
      apiKeysServiceApi.middleware,
      webhooksServiceApi.middleware,
      notificationsServiceApi.middleware,
      ipAddressesServiceApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
import { useDispatch, useSelector } from 'react-redux';
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
