import { useDispatch, useSelector } from "react-redux";
import { X, Activity, Settings } from "lucide-react";
import { toggleRightPanel } from "../store/uiSlice";
import { updateChatSettings } from "../store/chatSlice";
import { MODEL_OPTIONS, getModelLabel } from "../config/models";

export default function RightPanel() {
  const dispatch = useDispatch();
  const rightPanelOpen = useSelector((state) => state.ui.rightPanelOpen);
  const activeId = useSelector((state) => state.chat.activeConversationId);
  const conversations = useSelector((state) => state.chat.conversations);
  const activeChat = conversations.find((conversation) => conversation.id === activeId);

  if (!rightPanelOpen) return null;

  if (!activeChat) {
    return (
      <div className="w-[320px] bg-white dark:bg-[#16191B] border-l border-[#E7E7E7] dark:border-[#23272A] p-6 flex flex-col justify-between flex-shrink-0 z-30 select-none transition-colors duration-200">
        <div className="text-center py-8 text-xs text-[#737373] dark:text-[#94A3B8] transition-colors">
          No active chat configuration
        </div>
      </div>
    );
  }

  const handleSettingChange = (key, value) => {
    dispatch(updateChatSettings({ id: activeChat.id, key, value }));
  };

  const regions = ["global", "auto"];

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-[320px] bg-white dark:bg-[#16191B] border-l border-[#E7E7E7] dark:border-[#23272A] flex flex-col justify-between flex-shrink-0 transition-all duration-300 transform translate-x-0 shadow-lg md:shadow-none md:relative transition-colors duration-200">
      <div className="p-6 border-b border-[#E7E7E7] dark:border-[#23272A]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#171717] dark:text-[#eceff1] font-montserrat transition-colors">Run controls</h3>
            <Settings size={14} className="text-[#737373] dark:text-[#94A3B8]" />
          </div>
          <button
            onClick={() => dispatch(toggleRightPanel())}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:text-[#eceff1] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-[11px] text-[#737373] dark:text-[#94A3B8] mt-1.5 leading-normal transition-colors">
          Configure how this conversation calls the model API.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#171717] dark:text-[#eceff1] uppercase tracking-wider block transition-colors">
            Model
          </label>
          <div className="relative">
            <select
              value={activeChat.model}
              onChange={(event) => handleSettingChange("model", event.target.value)}
              className="w-full h-10 px-3.5 bg-white dark:bg-[#1E2326] border border-[#E7E7E7] dark:border-[#23272A] rounded-lg text-xs text-[#171717] dark:text-[#eceff1] font-semibold shadow-sm focus:outline-none focus:border-[#245955] dark:focus:border-[#347d78] cursor-pointer appearance-none transition-colors"
            >
              {MODEL_OPTIONS.map((model) => (
                <option key={model.id} value={model.id}>{model.label}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#737373] dark:text-[#94A3B8] text-[10px]">
              ▼
            </div>
          </div>
          <p className="text-[10px] text-[#737373] dark:text-[#94A3B8] leading-normal">
            Current model ID: {activeChat.model}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#171717] dark:text-[#eceff1] uppercase tracking-wider block transition-colors">
            Provider
          </label>
          <input
            type="text"
            value={activeChat.provider || "OpenRouter"}
            disabled
            className="w-full h-10 px-3.5 bg-[#FAFAFA] dark:bg-[#0f1214] border border-[#E7E7E7] dark:border-[#23272A] rounded-lg text-xs text-[#737373] dark:text-[#94A3B8] font-semibold focus:outline-none select-none transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#171717] dark:text-[#eceff1] uppercase tracking-wider block transition-colors">
            Region
          </label>
          <div className="relative">
            <select
              value={activeChat.region}
              onChange={(event) => handleSettingChange("region", event.target.value)}
              className="w-full h-10 px-3.5 bg-white dark:bg-[#1E2326] border border-[#E7E7E7] dark:border-[#23272A] rounded-lg text-xs text-[#171717] dark:text-[#eceff1] font-semibold shadow-sm focus:outline-none focus:border-[#245955] dark:focus:border-[#347d78] cursor-pointer appearance-none transition-colors"
            >
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#737373] dark:text-[#94A3B8] text-[10px]">
              ▼
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#171717] dark:text-[#eceff1] uppercase tracking-wider block transition-colors">
            Max tokens
          </label>
          <input
            type="number"
            value={activeChat.maxTokens}
            onChange={(event) => handleSettingChange("maxTokens", parseInt(event.target.value, 10) || 0)}
            className="w-full h-10 px-3.5 bg-white dark:bg-[#1E2326] border border-[#E7E7E7] dark:border-[#23272A] text-xs text-[#171717] dark:text-[#eceff1] rounded-lg font-semibold shadow-sm focus:outline-none focus:border-[#245955] dark:focus:border-[#347d78] transition-colors"
          />
        </div>

        <div className="pt-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#171717] dark:text-[#eceff1] transition-colors">Use Knowledge Base</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={activeChat.useKnowledgeBase}
                onChange={(event) => handleSettingChange("useKnowledgeBase", event.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#171717] dark:text-[#eceff1] transition-colors">Use Guardrails</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={activeChat.useGuardrails}
                onChange={(event) => handleSettingChange("useGuardrails", event.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-[#E7E7E7] dark:border-[#23272A] bg-[#FAFAFA] dark:bg-[#0f1214] transition-colors duration-200">
        <div className="flex items-start gap-3.5 p-4 bg-white dark:bg-[#16191B] border border-[#E7E7E7] dark:border-[#23272A] rounded-xl shadow-sm transition-colors">
          <div className="w-10 h-10 rounded-lg bg-[#E7F3F1] dark:bg-[#183331] flex items-center justify-center text-[#245955] dark:text-[#347d78] flex-shrink-0 transition-colors">
            <Activity size={18} className="pulse-green" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#171717] dark:text-[#eceff1] font-montserrat transition-colors">Request health</h4>
              <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            </div>
            <p className="text-[10px] text-[#737373] dark:text-[#94A3B8] mt-0.5 leading-normal transition-colors">
              Browser API route ready
            </p>
            <p className="text-[10px] text-[#737373] dark:text-[#94A3B8] mt-1 leading-normal transition-colors">
              Active model: {getModelLabel(activeChat.model)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
