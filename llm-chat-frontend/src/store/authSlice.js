import { createSlice } from "@reduxjs/toolkit";

const getStoredUser = () => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
  return null;
};

const getStoredUsersDb = () => {
  if (typeof window !== "undefined") {
    const db = localStorage.getItem("users_db");
    return db ? JSON.parse(db) : [
      { email: "demo@bedrock.com", password: "password123", name: "Demo User" }
    ];
  }
  return [];
};

const initialState = {
  isAuthenticated: !!getStoredUser(),
  user: getStoredUser(),
  usersDb: getStoredUsersDb(),
  isLoading: false,
  error: null,
  recoveryEmailSent: false,
  resetPasswordCompleted: false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authStart(state) {
      state.isLoading = true;
      state.error = null;
      state.recoveryEmailSent = false;
      state.resetPasswordCompleted = false;
    },
    loginSuccess(state, action) {
      const { user, accessToken, refreshToken } = action.payload;
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = user || action.payload;
      state.error = null;
      if (user || action.payload) localStorage.setItem("user", JSON.stringify(user || action.payload));
      if (accessToken) localStorage.setItem("token", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    },
    authFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    registerSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
    },
    recoverySuccess(state) {
      state.isLoading = false;
      state.recoveryEmailSent = true;
      state.error = null;
    },
    resetPasswordSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.recoveryEmailSent = false;
      state.resetPasswordCompleted = true;
    },
    logout(state) {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      state.recoveryEmailSent = false;
      state.resetPasswordCompleted = false;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    },
    clearError(state) {
      state.error = null;
      state.recoveryEmailSent = false;
      state.resetPasswordCompleted = false;
    }
  }
});

export const {
  authStart,
  loginSuccess,
  authFailure,
  registerSuccess,
  recoverySuccess,
  resetPasswordSuccess,
  logout,
  clearError
} = authSlice.actions;

export default authSlice.reducer;
