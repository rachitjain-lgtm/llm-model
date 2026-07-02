import { useDispatch, useSelector } from "react-redux";
import { X, Sun, Moon, ShieldCheck, Cpu } from "lucide-react";
import { setApiKey, setAppName, setSettingsModalOpen, setTheme } from "../store/uiSlice";

export default function SettingsModal() {
  const dispatch = useDispatch();
  const settingsModalOpen = useSelector((state) => state.ui.settingsModalOpen);
  const theme = useSelector((state) => state.ui.theme);
  const apiKey = useSelector((state) => state.ui.apiKey);
  const appName = useSelector((state) => state.ui.appName);
  const providerName = useSelector((state) => state.ui.providerName);

  if (!settingsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={() => dispatch(setSettingsModalOpen(false))}
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md cursor-pointer transition-opacity"
      />

      <div className="relative w-full max-w-md bg-white dark:bg-[#16191B] border border-[#E7E7E7] dark:border-[#23272A] rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-200 transform animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-[#E7E7E7] dark:border-[#23272A] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#171717] dark:text-[#eceff1] font-montserrat tracking-wide">
            Global Settings
          </h3>
          <button
            onClick={() => dispatch(setSettingsModalOpen(false))}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:text-[#eceff1] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-[#737373] dark:text-[#94A3B8] uppercase tracking-wider block">
              Interface Theme
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => dispatch(setTheme("light"))}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-200 ${
                  theme === "light"
                    ? "bg-[#245955] text-white border-[#245955] shadow-sm shadow-[#245955]/20"
                    : "bg-white dark:bg-[#1E2326] border-[#E7E7E7] dark:border-[#23272A] text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:bg-[#262B2E] dark:hover:text-[#eceff1]"
                }`}
              >
                <Sun size={14} />
                Light Mode
              </button>
              <button
                onClick={() => dispatch(setTheme("dark"))}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-200 ${
                  theme === "dark"
                    ? "bg-[#245955] text-white border-[#245955] shadow-sm shadow-[#245955]/20"
                    : "bg-white dark:bg-[#1E2326] border-[#E7E7E7] dark:border-[#23272A] text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:bg-[#262B2E] dark:hover:text-[#eceff1]"
                }`}
              >
                <Moon size={14} />
                Dark Mode
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-[#737373] dark:text-[#94A3B8] uppercase tracking-wider block">
              Model API
            </label>
            <div className="space-y-3 p-4 bg-[#FAFAFA] dark:bg-[#1E2326] border border-[#E7E7E7] dark:border-[#23272A] rounded-xl transition-colors">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#171717] dark:text-[#eceff1] block">
                  Provider
                </label>
                <input
                  type="text"
                  value={providerName}
                  disabled
                  className="w-full h-10 px-3.5 bg-white dark:bg-[#16191B] border border-[#E7E7E7] dark:border-[#23272A] rounded-lg text-xs text-[#737373] dark:text-[#94A3B8] font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#171717] dark:text-[#eceff1] block">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(event) => dispatch(setApiKey(event.target.value))}
                  placeholder="Paste your OpenRouter key"
                  className="w-full h-10 px-3.5 bg-white dark:bg-[#16191B] border border-[#E7E7E7] dark:border-[#23272A] rounded-lg text-xs text-[#171717] dark:text-[#eceff1] font-semibold focus:outline-none focus:border-[#245955] dark:focus:border-[#347d78]"
                />
                <p className="text-[10px] text-[#737373] dark:text-[#94A3B8] leading-normal">
                  Stored locally in this browser. For production, move provider calls to a backend so keys are not exposed to the client.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#171717] dark:text-[#eceff1] block">
                  App Name
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(event) => dispatch(setAppName(event.target.value))}
                  placeholder="AI Studio"
                  className="w-full h-10 px-3.5 bg-white dark:bg-[#16191B] border border-[#E7E7E7] dark:border-[#23272A] rounded-lg text-xs text-[#171717] dark:text-[#eceff1] font-semibold focus:outline-none focus:border-[#245955] dark:focus:border-[#347d78]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-semibold text-[#737373] dark:text-[#94A3B8] uppercase tracking-wider block">
              Infrastructure Status
            </label>
            <div className="p-4 bg-[#FAFAFA] dark:bg-[#1E2326] border border-[#E7E7E7] dark:border-[#23272A] rounded-xl space-y-3.5 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-[#737373] dark:text-[#94A3B8]">
                  <Cpu size={14} />
                  <span>Base Provider</span>
                </div>
                <span className="text-xs font-semibold text-[#171717] dark:text-[#eceff1]">
                  {providerName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-[#737373] dark:text-[#94A3B8]">
                  <ShieldCheck size={14} />
                  <span>API Key Status</span>
                </div>
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${apiKey ? "text-[#245955] dark:text-[#347d78]" : "text-[#737373] dark:text-[#94A3B8]"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${apiKey ? "bg-[#245955] dark:bg-[#347d78] animate-pulse" : "bg-[#A3A3A3] dark:bg-[#64748B]"}`} />
                  {apiKey ? "Configured" : "Missing"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-[#FAFAFA] dark:bg-[#1A1D1F] border-t border-[#E7E7E7] dark:border-[#23272A] flex justify-end gap-3 transition-colors">
          <button
            onClick={() => dispatch(setSettingsModalOpen(false))}
            className="px-4 h-9 bg-white dark:bg-[#1E2326] hover:bg-slate-100 dark:hover:bg-[#262B2E] border border-[#E7E7E7] dark:border-[#23272A] rounded-lg text-xs font-semibold text-[#171717] dark:text-[#eceff1] cursor-pointer shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
