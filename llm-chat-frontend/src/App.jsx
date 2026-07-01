import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ChatWindow from "./components/ChatWindow";
import PromptComposer from "./components/PromptComposer";
import RightPanel from "./components/RightPanel";
import SettingsModal from "./components/SettingsModal";
import Login from "./components/Login";
import { setSidebarOpen } from "./store/uiSlice";

function App() {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const theme = useSelector((state) => state.ui.theme);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F7F7] dark:bg-[#0f1214] text-[#171717] dark:text-[#eceff1] transition-colors duration-200">
      
      {/* Sidebar Overlay for mobile views */}
      {sidebarOpen && (
        <div 
          onClick={() => dispatch(setSidebarOpen(false))}
          className="fixed inset-0 bg-black/45 z-30 md:hidden cursor-pointer backdrop-blur-[1px] transition-opacity"
        />
      )}

      {/* Left Sidebar */}
      <Sidebar />

      {/* Central Chat area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <Topbar />
        
        {/* Scrollable messages container */}
        <ChatWindow />
        
        {/* Bottom Prompter */}
        <PromptComposer />
      </div>

      {/* Right Control Settings Panel */}
      <RightPanel />

      {/* Global Settings Modal */}
      <SettingsModal />

    </div>
  );
}

export default App;