import { createSlice } from "@reduxjs/toolkit";

const defaultApiSettings = {
  apiKey: "",
  appName: import.meta.env.VITE_APP_NAME || "AI Studio",
  providerName: "OpenRouter",
  apiBaseUrl: import.meta.env.VITE_OPENROUTER_API_URL || "https://openrouter.ai/api/v1/chat/completions"
};

const getStoredApiSettings = () => {
  if (typeof window === "undefined") {
    return defaultApiSettings;
  }

  const saved = localStorage.getItem("api_settings");

  if (!saved) {
    return {
      ...defaultApiSettings,
      apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || ""
    };
  }

  try {
    return {
      ...defaultApiSettings,
      ...JSON.parse(saved)
    };
  } catch {
    return defaultApiSettings;
  }
};

const persistApiSettings = (state) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("api_settings", JSON.stringify({
    apiKey: state.apiKey,
    appName: state.appName,
    providerName: state.providerName,
    apiBaseUrl: state.apiBaseUrl
  }));
};

const storedApiSettings = getStoredApiSettings();

const initialState = {
  sidebarOpen: true,
  modelDropdownOpen: false,
  kbDropdownOpen: false,
  activeKbId: "kb-3e7f2a1",
  theme: typeof window !== "undefined" ? (localStorage.getItem("theme") || "light") : "light",
  settingsModalOpen: false,
  promptLibraryModalOpen: false,
  apiKey: storedApiSettings.apiKey,
  appName: storedApiSettings.appName,
  providerName: storedApiSettings.providerName,
  apiBaseUrl: storedApiSettings.apiBaseUrl,
  rightPanelOpen: false,
  regionDropdownOpen: false
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
    },
    toggleModelDropdown(state) {
      state.modelDropdownOpen = !state.modelDropdownOpen;
    },
    setModelDropdownOpen(state, action) {
      state.modelDropdownOpen = action.payload;
    },
    toggleKbDropdown(state) {
      state.kbDropdownOpen = !state.kbDropdownOpen;
    },
    setKbDropdownOpen(state, action) {
      state.kbDropdownOpen = action.payload;
    },
    setActiveKbId(state, action) {
      state.activeKbId = action.payload;
    },
    toggleTheme(state) {
      const nextTheme = state.theme === "light" ? "dark" : "light";
      state.theme = nextTheme;
      localStorage.setItem("theme", nextTheme);
    },
    setTheme(state, action) {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
    },
    toggleSettingsModal(state) {
      state.settingsModalOpen = !state.settingsModalOpen;
    },
    setSettingsModalOpen(state, action) {
      state.settingsModalOpen = action.payload;
    },
    togglePromptLibraryModal(state) {
      state.promptLibraryModalOpen = !state.promptLibraryModalOpen;
    },
    setPromptLibraryModalOpen(state, action) {
      state.promptLibraryModalOpen = action.payload;
    },
    setApiKey(state, action) {
      state.apiKey = action.payload;
      persistApiSettings(state);
    },
    setAppName(state, action) {
      state.appName = action.payload;
      persistApiSettings(state);
    },
    toggleRightPanel(state) {
      state.rightPanelOpen = !state.rightPanelOpen;
    },
    setRightPanelOpen(state, action) {
      state.rightPanelOpen = action.payload;
    },
    toggleRegionDropdown(state) {
      state.regionDropdownOpen = !state.regionDropdownOpen;
    },
    setRegionDropdownOpen(state, action) {
      state.regionDropdownOpen = action.payload;
    }
  }
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleModelDropdown,
  setModelDropdownOpen,
  toggleKbDropdown,
  setKbDropdownOpen,
  setActiveKbId,
  toggleTheme,
  setTheme,
  toggleSettingsModal,
  setSettingsModalOpen,
  setPromptLibraryModalOpen,
  setApiKey,
  setAppName,
  toggleRightPanel,
  setRightPanelOpen,
  toggleRegionDropdown,
  setRegionDropdownOpen
} = uiSlice.actions;

export default uiSlice.reducer;
