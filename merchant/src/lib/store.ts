import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";
import authReducer from "./slices/authSlice";
import { transactionsServiceApi } from "./services/transactionsServiceApi";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    [transactionsServiceApi.reducerPath]: transactionsServiceApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(transactionsServiceApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

