import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ChatWindow from "./components/ChatWindow";
import PromptComposer from "./components/PromptComposer";
import SettingsModal from "./components/SettingsModal";
import ProviderManagerModal from "./components/ProviderManagerModal";
import PromptLibraryModal from "./components/PromptLibraryModal";
import Login from "./components/Login";
import { setSidebarOpen } from "./store/uiSlice";
import { fetchChats } from "./store/chatSlice";
import { logout } from "./store/authSlice";
import { fetchProviders } from "./store/providerSlice";

function App() {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const theme = useSelector((state) => state.ui.theme);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchChats());
      dispatch(fetchProviders());
    }
  }, [isAuthenticated, dispatch]);

  // Idle Activity Logout: logout after 15 minutes of inactivity
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId;
    const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

    const resetIdleTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log("User has been idle for 15 minutes. Logging out...");
        dispatch(logout());
      }, IDLE_TIMEOUT_MS);
    };

    const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    resetIdleTimer();

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetIdleTimer);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer);
      });
    };
  }, [isAuthenticated, dispatch]);

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
      {sidebarOpen && (
        <div
          onClick={() => dispatch(setSidebarOpen(false))}
          className="fixed inset-0 bg-black/45 z-30 md:hidden cursor-pointer backdrop-blur-[1px] transition-opacity"
        />
      )}

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <Topbar />
        <ChatWindow />
        <PromptComposer />
      </div>

      <SettingsModal />
      <ProviderManagerModal />
      <PromptLibraryModal />
    </div>
  );
}

export default App;
