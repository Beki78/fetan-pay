import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "./api";
import { adminWebhooksServiceApi } from "../services/adminWebhooksServiceApi";
import { tipsApi } from "../services/tipsApi";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [adminWebhooksServiceApi.reducerPath]: adminWebhooksServiceApi.reducer,
    [tipsApi.reducerPath]: tipsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(baseApi.middleware)
      .concat(adminWebhooksServiceApi.middleware)
      .concat(tipsApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
