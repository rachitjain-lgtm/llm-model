import { createSlice } from "@reduxjs/toolkit";

const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;

const initialState = {
  isAuthenticated: !!storedUser,
  user: storedUser ? JSON.parse(storedUser) : null,
  isLoading: false,
  error: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    loginFailure(state, action) {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
    },
    logout(state) {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      localStorage.removeItem("user");
    },
    clearError(state) {
      state.error = null;
    }
  }
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError
} = authSlice.actions;

export default authSlice.reducer;
