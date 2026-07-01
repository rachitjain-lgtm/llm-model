import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Paperclip, 
  Database, 
  Shield, 
  BookOpen, 
  Send, 
  SlidersHorizontal,
  Check,
  Search
} from "lucide-react";
import { 
  addMessage, 
  setLoading, 
  updateLastMessageText, 
  addSourceToLastMessage,
  updateChatSettings 
} from "../store/chatSlice";
import { 
  toggleRightPanel, 
  setActiveKbId, 
  toggleKbDropdown, 
  setKbDropdownOpen 
} from "../store/uiSlice";
import { chatApi } from "../api/chatApi";

export default function PromptComposer() {
  const dispatch = useDispatch();
  const activeId = useSelector(state => state.chat.activeConversationId);
  const conversations = useSelector(state => state.chat.conversations);
  const activeChat = conversations.find(c => c.id === activeId);
  const isLoading = useSelector(state => state.chat.isLoading);

  const kbDropdownOpen = useSelector(state => state.ui.kbDropdownOpen);
  const activeKbId = useSelector(state => state.ui.activeKbId);

  const [inputText, setInputText] = useState("");
  const [kbSearch, setKbSearch] = useState("");
  const kbRef = useRef(null);

  // Close KB selector on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (kbRef.current && !kbRef.current.contains(event.target)) {
        dispatch(setKbDropdownOpen(false));
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dispatch]);

  if (!activeChat) return null;

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;

    const userMessageText = inputText.trim();
    setInputText("");

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Add User Message
    dispatch(addMessage({
      chatId: activeChat.id,
      message: {
        id: `msg-${Date.now()}-user`,
        sender: "user",
        text: userMessageText,
        time: timeStr,
        initials: "AR"
      }
    }));

    // 2. Set loading state
    dispatch(setLoading(true));

    // 3. Add blank assistant bubble to stream into
    const assistantMsgId = `msg-${Date.now()}-assistant`;
    dispatch(addMessage({
      chatId: activeChat.id,
      message: {
        id: assistantMsgId,
        sender: "assistant",
        text: "",
        time: timeStr,
        sources: null
      }
    }));

    // 4. Trigger mock streaming
    chatApi.sendMessageStream(
      activeChat.id,
      userMessageText,
      activeChat.model,
      activeChat.useKnowledgeBase,
      (chunk) => {
        // Stream text chunk
        dispatch(updateLastMessageText({ chatId: activeChat.id, text: chunk }));
      },
      (finalText, sources) => {
        // Stream done
        dispatch(updateLastMessageText({ chatId: activeChat.id, text: finalText }));
        if (sources) {
          sources.forEach(src => {
            dispatch(addSourceToLastMessage({ chatId: activeChat.id, source: src }));
          });
        }
        dispatch(setLoading(false));
      }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // KB Options
  const kbOptions = [
    { id: "kb-3e7f2a1", title: "Product Docs KB", detail: "ID: kb-3e7f2a1" },
    { id: "kb-8f7e1c8b", title: "Marketing KB", detail: "ID: kb-8f7e1c8b" },
    { id: "kb-1bf70d12", title: "Support KB", detail: "ID: kb-1bf70d12" }
  ];

  const activeKb = kbOptions.find(k => k.id === activeKbId);

  const filteredKbs = kbOptions.filter(k => 
    k.title.toLowerCase().includes(kbSearch.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 border-t border-[#E7E7E7] dark:border-[#23272A] bg-white dark:bg-[#16191B] flex flex-col flex-shrink-0 select-none transition-colors duration-200">
      
      {/* Compose Area Container */}
      <div className="relative border border-[#E7E7E7] dark:border-[#23272A] rounded-2xl bg-white dark:bg-[#1E2326] shadow-sm flex flex-col p-3 transition-colors duration-200">
        
        {/* Text Input area */}
        <textarea
          rows={2}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${activeChat.model}...`}
          className="w-full resize-none bg-transparent text-xs text-[#171717] dark:text-[#eceff1] placeholder-[#A3A3A3] dark:placeholder-[#64748B] focus:outline-none p-1 font-sans font-medium transition-colors"
        />

        {/* Action Row */}
        <div className="flex items-center justify-between border-t border-[#FAFAFA] dark:border-[#23272A] pt-2 mt-2">
          
          {/* Quick Buttons Left */}
          <div className="flex items-center gap-1.5 flex-wrap">
            
            {/* Attachment */}
            <button className="h-9 px-3 hover:bg-[#FAFAFA] dark:hover:bg-[#23272A] border border-transparent hover:border-[#E7E7E7] dark:hover:border-[#23272A] rounded-xl flex items-center gap-2 text-[11px] font-semibold text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:text-[#eceff1] transition-all cursor-pointer">
              <Paperclip size={14} />
              <span>Attach</span>
            </button>

            {/* Knowledge Base selector trigger */}
            <div className="relative" ref={kbRef}>
              <button 
                onClick={() => dispatch(toggleKbDropdown())}
                className={`h-9 px-3 rounded-xl flex items-center gap-2 text-[11px] font-semibold transition-all cursor-pointer border
                  ${activeChat.useKnowledgeBase 
                    ? "bg-[#E7F3F1] dark:bg-[#183331] border-[#245955]/20 dark:border-[#347d78]/30 text-[#245955] dark:text-[#347d78] hover:bg-[#d5ebe7] dark:hover:bg-[#204441]" 
                    : "bg-transparent border-transparent hover:bg-[#FAFAFA] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:text-[#eceff1]"}`}
              >
                <Database size={14} />
                <span>
                  {activeChat.useKnowledgeBase && activeKb 
                    ? activeKb.title 
                    : "Knowledge Base"}
                </span>
              </button>

              {/* KB Selector Dropdown Card */}
              {kbDropdownOpen && (
                <div className="absolute left-0 bottom-full mb-2 w-72 bg-white dark:bg-[#1E2326] border border-[#E7E7E7] dark:border-[#23272A] rounded-xl shadow-lg p-3 z-50 transition-colors">
                  <div className="text-xs font-bold text-[#171717] dark:text-[#eceff1] pb-2 font-montserrat transition-colors">Knowledge Base</div>
                  
                  {/* Search in KB */}
                  <div className="relative mb-2">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737373] dark:text-[#94A3B8]" />
                    <input 
                      type="text"
                      placeholder="Search knowledge bases"
                      value={kbSearch}
                      onChange={(e) => setKbSearch(e.target.value)}
                      className="w-full h-8 bg-[#F5F7F7] dark:bg-[#0f1214] border border-[#E7E7E7] dark:border-[#23272A] text-[#171717] dark:text-[#eceff1] rounded-lg pl-8 pr-3 text-[10px] placeholder-[#A3A3A3] dark:placeholder-[#64748B] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {filteredKbs.map((kb) => (
                      <div 
                        key={kb.id}
                        onClick={() => {
                          dispatch(setActiveKbId(kb.id));
                          dispatch(updateChatSettings({ id: activeChat.id, key: "useKnowledgeBase", value: true }));
                          dispatch(setKbDropdownOpen(false));
                        }}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border
                          ${activeKbId === kb.id && activeChat.useKnowledgeBase
                            ? "bg-[#E7F3F1] dark:bg-[#183331] border-[#245955]/20 dark:border-[#347d78]/30 text-[#245955] dark:text-[#347d78]" 
                            : "bg-transparent border-transparent hover:bg-[#FAFAFA] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8]"}`}
                      >
                        <div>
                          <div className="text-[11px] font-semibold">{kb.title}</div>
                          <div className="text-[9px] text-[#A3A3A3] dark:text-[#64748B] mt-0.5">{kb.detail}</div>
                        </div>
                        {activeKbId === kb.id && activeChat.useKnowledgeBase && (
                          <div className="w-4 h-4 rounded-full bg-[#245955] dark:bg-[#347d78] flex items-center justify-center text-white">
                            <Check size={10} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#E7E7E7] dark:border-[#23272A] mt-2 pt-2 text-center">
                    <button className="text-[10px] font-bold text-[#245955] dark:text-[#347d78] hover:text-[#1d4643] dark:hover:text-[#2b6763] cursor-pointer">
                      Manage knowledge bases
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Guardrails toggle */}
            <button 
              onClick={() => dispatch(updateChatSettings({ id: activeChat.id, key: "useGuardrails", value: !activeChat.useGuardrails }))}
              className={`h-9 px-3 rounded-xl flex items-center gap-2 text-[11px] font-semibold transition-all cursor-pointer border
                ${activeChat.useGuardrails 
                  ? "bg-[#E7F3F1] dark:bg-[#183331] border-[#245955]/20 dark:border-[#347d78]/30 text-[#245955] dark:text-[#347d78] hover:bg-[#d5ebe7] dark:hover:bg-[#204441]" 
                  : "bg-transparent border-transparent hover:bg-[#FAFAFA] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:text-[#eceff1]"}`}
            >
              <Shield size={14} />
              <span>Guardrails</span>
            </button>

            {/* Prompt Library */}
            <button className="h-9 px-3 hover:bg-[#FAFAFA] dark:hover:bg-[#23272A] border border-transparent hover:border-[#E7E7E7] dark:border-[#23272A] rounded-xl flex items-center gap-2 text-[11px] font-semibold text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:text-[#eceff1] transition-all cursor-pointer">
              <BookOpen size={14} />
              <span>Prompt library</span>
            </button>
          </div>

          {/* Right Tools Controls + Send */}
          <div className="flex items-center gap-2">
            
            {/* Tune setting toggle */}
            <button 
              onClick={() => dispatch(toggleRightPanel())}
              className="p-2 hover:bg-[#FAFAFA] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:text-[#eceff1] rounded-xl transition-all cursor-pointer"
              title="Tune Configuration"
            >
              <SlidersHorizontal size={14} />
            </button>

            {/* Send circle */}
            <button 
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all cursor-pointer shadow-sm
                ${inputText.trim() && !isLoading 
                  ? "bg-[#245955] dark:bg-[#347d78] hover:bg-[#1d4643] dark:hover:bg-[#2b6763]" 
                  : "bg-slate-200 dark:bg-zinc-800 cursor-not-allowed text-slate-400 dark:text-zinc-600"}`}
            >
              <Send size={14} className={inputText.trim() ? "translate-x-0.5 -translate-y-0.5 rotate-45" : ""} />
            </button>
          </div>

        </div>
      </div>

      {/* Disclaimers footnote */}
      <div className="text-[10px] text-[#A3A3A3] dark:text-[#64748B] text-center mt-3 select-none transition-colors">
        LLM responses may be inaccurate. Verify critical outputs before use.
      </div>
    </div>
  );
}

