import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Sun, Moon, ShieldCheck, Cpu, Trash2, CheckCircle2, SlidersHorizontal, Settings2 } from "lucide-react";
import { setSettingsModalOpen, setTheme, setProviderManagerModalOpen } from "../store/uiSlice";
import { clearActiveChat, updateChatSettings } from "../store/chatSlice";
import { selectAllProviderProfiles } from "../store/providerSlice";
import { getModelsForProvider, getDefaultModelForProvider, getModelLabel, getProviderProfileLabel } from "../config/models";

export default function SettingsModal() {
  const dispatch = useDispatch();
  const settingsModalOpen = useSelector((state) => state.ui.settingsModalOpen);
  const theme = useSelector((state) => state.ui.theme);
  const activeId = useSelector((state) => state.chat.activeConversationId);
  const conversations = useSelector((state) => state.chat.conversations);
  const providerProfiles = useSelector(selectAllProviderProfiles);
  const activeChat = conversations.find((c) => c.id === activeId);

  const [confirmClear, setConfirmClear] = useState(false);
  const [clearedSuccess, setClearedSuccess] = useState(false);

  if (!settingsModalOpen) return null;

  const selectedProviderId = activeChat?.provider || "openrouter";
  const selectedProviderProfile = providerProfiles.find((profile) => profile.id === selectedProviderId) || providerProfiles.find((profile) => profile.providerType === selectedProviderId);
  const providerModels = getModelsForProvider(selectedProviderId, providerProfiles);
  const currentModel = providerModels.some((model) => model.id === activeChat?.model)
    ? activeChat?.model
    : getDefaultModelForProvider(selectedProviderId, providerProfiles);

  const handleClearChat = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    dispatch(clearActiveChat());
    setConfirmClear(false);
    setClearedSuccess(true);
    setTimeout(() => setClearedSuccess(false), 2500);
  };

  const handleProviderChange = (event) => {
    if (!activeChat) return;
    const nextProvider = event.target.value;
    const nextModel = getDefaultModelForProvider(nextProvider, providerProfiles);
    dispatch(updateChatSettings({ id: activeChat.id, key: "provider", value: nextProvider }));
    dispatch(updateChatSettings({ id: activeChat.id, key: "model", value: nextModel }));
  };

  const handleModelChange = (event) => {
    if (!activeChat) return;
    dispatch(updateChatSettings({ id: activeChat.id, key: "model", value: event.target.value }));
  };

  const hasMessages = activeChat && activeChat.messages && activeChat.messages.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={() => dispatch(setSettingsModalOpen(false))} className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md cursor-pointer transition-opacity" />

      <div className="relative w-full max-w-md bg-white dark:bg-[#16191B] border border-[#E7E7E7] dark:border-[#23272A] rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-200 transform animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-[#E7E7E7] dark:border-[#23272A] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#171717] dark:text-[#eceff1] font-montserrat tracking-wide">Global Settings</h3>
          <button onClick={() => dispatch(setSettingsModalOpen(false))} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:text-[#eceff1] transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-[#737373] dark:text-[#94A3B8] uppercase tracking-wider block">Interface Theme</label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => dispatch(setTheme("light"))} className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-200 ${theme === "light" ? "bg-[#245955] text-white border-[#245955] shadow-sm shadow-[#245955]/20" : "bg-white dark:bg-[#1E2326] border-[#E7E7E7] dark:border-[#23272A] text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:bg-[#262B2E] dark:hover:text-[#eceff1]"}`}>
                <Sun size={14} />
                Light Mode
              </button>
              <button onClick={() => dispatch(setTheme("dark"))} className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-200 ${theme === "dark" ? "bg-[#245955] text-white border-[#245955] shadow-sm shadow-[#245955]/20" : "bg-white dark:bg-[#1E2326] border-[#E7E7E7] dark:border-[#23272A] text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:bg-[#262B2E] dark:hover:text-[#eceff1]"}`}>
                <Moon size={14} />
                Dark Mode
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-semibold text-[#737373] dark:text-[#94A3B8] uppercase tracking-wider block">Active Conversation</label>
            <div className="p-4 bg-[#FAFAFA] dark:bg-[#1E2326] border border-[#E7E7E7] dark:border-[#23272A] rounded-xl flex items-center justify-between transition-colors">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#171717] dark:text-[#eceff1] truncate max-w-[200px]">{activeChat ? activeChat.title : "No conversation selected"}</span>
                <span className="text-[10px] text-[#737373] dark:text-[#94A3B8]">{hasMessages ? `${activeChat.messages.length} message(s) in thread` : "No messages in active chat"}</span>
              </div>
              <button disabled={!hasMessages} onClick={handleClearChat} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${clearedSuccess ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : confirmClear ? "bg-rose-600 text-white hover:bg-rose-700 animate-pulse" : hasMessages ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20" : "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-[#262B2E] text-[#94A3B8]"}`}>
                {clearedSuccess ? <><CheckCircle2 size={13} />Cleared!</> : confirmClear ? <><Trash2 size={13} />Confirm Clear?</> : <><Trash2 size={13} />Clear Opened Chat</>}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-[11px] font-semibold text-[#737373] dark:text-[#94A3B8] uppercase tracking-wider block">Model API</label>
              <button onClick={() => dispatch(setProviderManagerModalOpen(true))} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7E7E7] dark:border-[#23272A] bg-white dark:bg-[#1E2326] text-[11px] font-semibold text-[#171717] dark:text-[#eceff1] hover:bg-slate-50 dark:hover:bg-[#262B2E] transition-colors">
                <Settings2 size={13} />
                Manage Providers
              </button>
            </div>
            <div className="space-y-3 p-4 bg-[#FAFAFA] dark:bg-[#1E2326] border border-[#E7E7E7] dark:border-[#23272A] rounded-xl transition-colors">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#171717] dark:text-[#eceff1] block">Provider</label>
                <div className="relative">
                  <select value={selectedProviderId} onChange={handleProviderChange} className="w-full h-10 px-3.5 bg-white dark:bg-[#16191B] border border-[#E7E7E7] dark:border-[#23272A] rounded-lg text-xs text-[#171717] dark:text-[#eceff1] font-semibold shadow-sm focus:outline-none focus:border-[#245955] dark:focus:border-[#347d78] cursor-pointer appearance-none transition-colors">
                    {providerProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {getProviderProfileLabel(profile)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#737373] dark:text-[#94A3B8] text-[10px]">?</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#171717] dark:text-[#eceff1] block">Model</label>
                <div className="relative">
                  <select value={currentModel} onChange={handleModelChange} className="w-full h-10 px-3.5 bg-white dark:bg-[#16191B] border border-[#E7E7E7] dark:border-[#23272A] rounded-lg text-xs text-[#171717] dark:text-[#eceff1] font-semibold shadow-sm focus:outline-none focus:border-[#245955] dark:focus:border-[#347d78] cursor-pointer appearance-none transition-colors">
                    {providerModels.map((model) => <option key={model.id} value={model.id}>{model.label}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#737373] dark:text-[#94A3B8] text-[10px]">?</div>
                </div>
              </div>

              <p className="text-[10px] text-[#737373] dark:text-[#94A3B8] leading-normal">
                Only models supported by the selected provider are shown here.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-semibold text-[#737373] dark:text-[#94A3B8] uppercase tracking-wider block">Infrastructure Status</label>
            <div className="p-4 bg-[#FAFAFA] dark:bg-[#1E2326] border border-[#E7E7E7] dark:border-[#23272A] rounded-xl space-y-3.5 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-[#737373] dark:text-[#94A3B8]"><Cpu size={14} /><span>Base Provider</span></div>
                <span className="text-xs font-semibold text-[#171717] dark:text-[#eceff1]">{selectedProviderProfile ? getProviderProfileLabel(selectedProviderProfile) : selectedProviderId}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-[#737373] dark:text-[#94A3B8]"><ShieldCheck size={14} /><span>API Key Status</span></div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[#245955] dark:text-[#347d78]"><span className="w-1.5 h-1.5 rounded-full bg-[#245955] dark:bg-[#347d78] animate-pulse" />Backend-managed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-[#FAFAFA] dark:bg-[#1A1D1F] border-t border-[#E7E7E7] dark:border-[#23272A] flex justify-end gap-3 transition-colors">
          <button onClick={() => dispatch(setSettingsModalOpen(false))} className="px-4 h-9 bg-white dark:bg-[#1E2326] hover:bg-slate-100 dark:hover:bg-[#262B2E] border border-[#E7E7E7] dark:border-[#23272A] rounded-lg text-xs font-semibold text-[#171717] dark:text-[#eceff1] cursor-pointer shadow-sm transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
