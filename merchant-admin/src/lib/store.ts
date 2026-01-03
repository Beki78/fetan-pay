import { configureStore } from '@reduxjs/toolkit';
import { transactionsServiceApi } from './services/transactionsServiceApi';
import { merchantUsersServiceApi } from './services/merchantUsersServiceApi';

export const store = configureStore({
  reducer: {
    [transactionsServiceApi.reducerPath]: transactionsServiceApi.reducer,
    [merchantUsersServiceApi.reducerPath]: merchantUsersServiceApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      transactionsServiceApi.middleware,
      merchantUsersServiceApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
