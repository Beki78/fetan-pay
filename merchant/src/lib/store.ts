import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";
import authReducer from "./slices/authSlice";
import { transactionsServiceApi } from "./services/transactionsServiceApi";
import { paymentsServiceApi } from "./services/paymentsServiceApi";
import { qrLoginApi } from "./services/qrLoginApi";
import { subscriptionApi } from "./services/subscriptionServiceApi";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    [transactionsServiceApi.reducerPath]: transactionsServiceApi.reducer,
    [paymentsServiceApi.reducerPath]: paymentsServiceApi.reducer,
    [qrLoginApi.reducerPath]: qrLoginApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      transactionsServiceApi.middleware,
      paymentsServiceApi.middleware,
      qrLoginApi.middleware,
      subscriptionApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
