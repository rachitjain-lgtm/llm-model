import { createSlice } from "@reduxjs/toolkit";

const getStoredUser = () => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
  return null;
};

const getStoredToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

const clearStoredSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};

const getStoredUsersDb = () => {
  const defaultUsers = [
    { email: "demo@gmail.com", password: "Aashi1710", name: "Demo User" }
  ];
  if (typeof window !== "undefined") {
    const dbStr = localStorage.getItem("users_db");
    if (dbStr) {
      try {
        const db = JSON.parse(dbStr);
        const demoIdx = db.findIndex(u => u.email.toLowerCase() === "demo@gmail.com");
        if (demoIdx !== -1) {
          db[demoIdx].password = "Aashi1710";
        } else {
          db.push({ email: "demo@gmail.com", password: "Aashi1710", name: "Demo User" });
        }
        localStorage.setItem("users_db", JSON.stringify(db));
        return db;
      } catch (e) {
        // Fallback to default
      }
    }
    localStorage.setItem("users_db", JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return defaultUsers;
};

const initialState = {
  isAuthenticated: !!getStoredUser() && !!getStoredToken(),
  user: getStoredToken() ? getStoredUser() : null,
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
      state.isAuthenticated = !!accessToken;
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
    registerSuccess(state) {
      state.isLoading = false;
      state.error = null;
    },
    recoverySuccess(state) {
      state.isLoading = false;
      state.recoveryEmailSent = true;
      state.error = null;
    },
    resetPasswordSuccess(state) {
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
      clearStoredSession();
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

if (typeof window !== "undefined" && getStoredUser() && !getStoredToken()) {
  clearStoredSession();
}

export default authSlice.reducer;
