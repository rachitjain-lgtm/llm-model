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
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    authFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    registerSuccess(state, action) {
      state.isLoading = false;
      state.usersDb.push(action.payload);
      localStorage.setItem("users_db", JSON.stringify(state.usersDb));
      state.error = null;
    },
    recoverySuccess(state) {
      state.isLoading = false;
      state.recoveryEmailSent = true;
      state.error = null;
    },
    resetPasswordSuccess(state, action) {
      const { email, newPassword } = action.payload;
      state.isLoading = false;
      state.error = null;
      state.recoveryEmailSent = false;
      state.resetPasswordCompleted = true;
      const userIndex = state.usersDb.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      if (userIndex !== -1) {
        state.usersDb[userIndex].password = newPassword;
      } else {
        state.usersDb.push({ email, password: newPassword, name: email.split("@")[0] });
      }
      localStorage.setItem("users_db", JSON.stringify(state.usersDb));
    },
    logout(state) {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      state.recoveryEmailSent = false;
      state.resetPasswordCompleted = false;
      localStorage.removeItem("user");
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
