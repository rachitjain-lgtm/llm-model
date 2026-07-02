import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Sun, Moon, Laptop, ShieldCheck, Cpu, Trash2, CheckCircle2 } from "lucide-react";
import { setSettingsModalOpen, setTheme } from "../store/uiSlice";
import { clearActiveChat } from "../store/chatSlice";

export default function SettingsModal() {
  const dispatch = useDispatch();
  const settingsModalOpen = useSelector((state) => state.ui.settingsModalOpen);
  const theme = useSelector((state) => state.ui.theme);
  const activeId = useSelector((state) => state.chat.activeConversationId);
  const conversations = useSelector((state) => state.chat.conversations);
  const activeChat = conversations.find((c) => c.id === activeId);

  const [confirmClear, setConfirmClear] = useState(false);
  const [clearedSuccess, setClearedSuccess] = useState(false);

  if (!settingsModalOpen) return null;

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

  const hasMessages = activeChat && activeChat.messages && activeChat.messages.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={() => dispatch(setSettingsModalOpen(false))}
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md cursor-pointer transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#16191B] border border-[#E7E7E7] dark:border-[#23272A] rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-200 transform animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E7E7E7] dark:border-[#23272A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#171717] dark:text-[#eceff1] font-montserrat tracking-wide">
              Global Settings
            </h3>
          </div>
          <button 
            onClick={() => dispatch(setSettingsModalOpen(false))}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:text-[#eceff1] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Theme Selection */}
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
                    : "bg-white dark:bg-[#1E2326] border-[#E7E7E7] dark:border-[#23272A] text-[#737373] dark:text-[#94A3B8] hover:bg-slate-55 hover:text-[#171717] dark:hover:bg-[#262B2E] dark:hover:text-[#eceff1]"
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
                    : "bg-white dark:bg-[#1E2326] border-[#E7E7E7] dark:border-[#23272A] text-[#737373] dark:text-[#94A3B8] hover:bg-slate-55 hover:text-[#171717] dark:hover:bg-[#262B2E] dark:hover:text-[#eceff1]"
                }`}
              >
                <Moon size={14} />
                Dark Mode
              </button>
            </div>
          </div>

          {/* Opened Conversation Management */}
          <div className="space-y-3">
            <label className="text-[11px] font-semibold text-[#737373] dark:text-[#94A3B8] uppercase tracking-wider block">
              Active Conversation
            </label>
            <div className="p-4 bg-[#FAFAFA] dark:bg-[#1E2326] border border-[#E7E7E7] dark:border-[#23272A] rounded-xl flex items-center justify-between transition-colors">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#171717] dark:text-[#eceff1] truncate max-w-[200px]">
                  {activeChat ? activeChat.title : "No conversation selected"}
                </span>
                <span className="text-[10px] text-[#737373] dark:text-[#94A3B8]">
                  {hasMessages ? `${activeChat.messages.length} message(s) in thread` : "No messages in active chat"}
                </span>
              </div>
              <button
                disabled={!hasMessages}
                onClick={handleClearChat}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  clearedSuccess
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : confirmClear
                    ? "bg-rose-600 text-white hover:bg-rose-700 animate-pulse"
                    : hasMessages
                    ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                    : "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-[#262B2E] text-[#94A3B8]"
                }`}
              >
                {clearedSuccess ? (
                  <>
                    <CheckCircle2 size={13} />
                    Cleared!
                  </>
                ) : confirmClear ? (
                  <>
                    <Trash2 size={13} />
                    Confirm Clear?
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    Clear Opened Chat
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Connection Status & Infrastructure details */}
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
                  Cloud AI
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-[#737373] dark:text-[#94A3B8]">
                  <ShieldCheck size={14} />
                  <span>Security Gateway</span>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[#245955] dark:text-[#347d78]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#245955] dark:bg-[#347d78] animate-pulse" />
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
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
