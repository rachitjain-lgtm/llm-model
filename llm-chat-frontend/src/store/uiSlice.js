import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarOpen: true,
  modelDropdownOpen: false,
  kbDropdownOpen: false,
  activeKbId: "kb-3e7f2a1", // Default is Product Docs KB
  theme: typeof window !== "undefined" ? (localStorage.getItem("theme") || "light") : "light",
  settingsModalOpen: false,
  promptLibraryModalOpen: false
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
  togglePromptLibraryModal,
  setPromptLibraryModalOpen
} = uiSlice.actions;

export default uiSlice.reducer;
