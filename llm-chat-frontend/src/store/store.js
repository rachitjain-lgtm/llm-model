import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./chatSlice";
import uiReducer from "./uiSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    ui: uiReducer,
    auth: authReducer,
  },
});
