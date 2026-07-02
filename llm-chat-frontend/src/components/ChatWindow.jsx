import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Sparkles, Database, Shield, BookOpen } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { updateChatSettings } from "../store/chatSlice";
import { toggleKbDropdown, setPromptLibraryModalOpen } from "../store/uiSlice";

export default function ChatWindow() {
  const dispatch = useDispatch();
  const activeId = useSelector(state => state.chat.activeConversationId);
  const conversations = useSelector(state => state.chat.conversations);
  const activeChat = conversations.find(c => c.id === activeId);
  const isLoading = useSelector(state => state.chat.isLoading);

  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeChat?.messages?.length, isLoading]);

  if (!activeChat) {
    return (
      <div className="flex-1 bg-[#F5F7F7] dark:bg-[#0f1214] flex items-center justify-center p-6 select-none transition-colors duration-200">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#E7F3F1] dark:bg-[#183331] text-[#245955] dark:text-[#347d78] flex items-center justify-center mx-auto mb-4 transition-colors">
            <Sparkles size={24} className="pulse-green" />
          </div>
          <h3 className="text-sm font-bold text-[#171717] dark:text-[#eceff1] font-montserrat transition-colors">Welcome to AI Studio</h3>
          <p className="text-xs text-[#737373] dark:text-[#94A3B8] max-w-sm leading-normal transition-colors">
            Create or select a conversation in the sidebar to start calling foundation models.
          </p>
        </div>
      </div>
    );
  }

  const messages = activeChat.messages || [];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F7F7] dark:bg-[#0f1214] px-4 md:px-12 py-6 transition-colors duration-200">
      
      {messages.length === 0 ? (
        /* Stunning empty state */
        <div className="h-full flex flex-col justify-center items-center max-w-xl mx-auto text-center space-y-8 select-none">
          
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#E7F3F1] dark:bg-[#183331] text-[#245955] dark:text-[#347d78] flex items-center justify-center mx-auto shadow-sm transition-colors">
              <Sparkles size={28} className="text-[#245955] dark:text-[#347d78]" />
            </div>
            <h2 className="text-xl font-bold text-[#171717] dark:text-[#eceff1] font-montserrat tracking-tight mt-4 transition-colors">
              How can I help you today?
            </h2>
            <p className="text-xs text-[#737373] dark:text-[#94A3B8] max-w-xs leading-normal transition-colors">
              Ask anything, generate content, analyze data, and more.
            </p>
          </div>

          {/* Quick Action Tiles */}
          <div className="w-full space-y-3">
            {/* Knowledge Base */}
            <button 
              onClick={() => {
                dispatch(updateChatSettings({ id: activeChat.id, key: "useKnowledgeBase", value: true }));
                dispatch(toggleKbDropdown());
              }}
              className="w-full flex items-center justify-between p-4 bg-white dark:bg-[#16191B] border border-[#E7E7E7] dark:border-[#23272A] hover:border-[#245955] dark:hover:border-[#347d78] rounded-xl hover:shadow-sm transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <Database size={16} className="text-[#737373] dark:text-[#94A3B8] group-hover:text-[#245955] dark:group-hover:text-[#347d78] transition-colors" />
                <span className="text-xs font-semibold text-[#171717] dark:text-[#eceff1]">Knowledge Base</span>
              </div>
              <span className="text-[10px] text-[#A3A3A3] dark:text-[#64748B]">Configure source data</span>
            </button>

            {/* Guardrails */}
            <button 
              onClick={() => {
                dispatch(updateChatSettings({ id: activeChat.id, key: "useGuardrails", value: !activeChat.useGuardrails }));
              }}
              className="w-full flex items-center justify-between p-4 bg-white dark:bg-[#16191B] border border-[#E7E7E7] dark:border-[#23272A] hover:border-[#245955] dark:hover:border-[#347d78] rounded-xl hover:shadow-sm transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <Shield size={16} className="text-[#737373] dark:text-[#94A3B8] group-hover:text-[#245955] dark:group-hover:text-[#347d78] transition-colors" />
                <span className="text-xs font-semibold text-[#171717] dark:text-[#eceff1]">Guardrails</span>
              </div>
              <span className={`text-[10px] font-semibold ${activeChat.useGuardrails ? "text-emerald-500 dark:text-emerald-400" : "text-[#A3A3A3] dark:text-[#64748B]"}`}>
                {activeChat.useGuardrails ? "Active" : "Disabled"}
              </span>
            </button>

            {/* Prompt Library */}
            <button 
              onClick={() => dispatch(setPromptLibraryModalOpen(true))}
              className="w-full flex items-center justify-between p-4 bg-white dark:bg-[#16191B] border border-[#E7E7E7] dark:border-[#23272A] hover:border-[#245955] dark:hover:border-[#347d78] rounded-xl hover:shadow-sm transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <BookOpen size={16} className="text-[#737373] dark:text-[#94A3B8] group-hover:text-[#245955] dark:group-hover:text-[#347d78] transition-colors" />
                <span className="text-xs font-semibold text-[#171717] dark:text-[#eceff1]">Prompt library</span>
              </div>
              <span className="text-[10px] text-[#A3A3A3] dark:text-[#64748B]">Browse presets</span>
            </button>
          </div>
          
        </div>
      ) : (
        /* Conversation bubbles rendering */
        <div className="max-w-3xl mx-auto h-full">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Loading streaming indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 mb-6 ml-12">
              <div className="w-1.5 h-1.5 rounded-full bg-[#245955] dark:bg-[#347d78] animate-bounce" style={{ animationDelay: "0ms" }} />
               <div className="w-1.5 h-1.5 rounded-full bg-[#245955] dark:bg-[#347d78] animate-bounce" style={{ animationDelay: "150ms" }} />
               <div className="w-1.5 h-1.5 rounded-full bg-[#245955] dark:bg-[#347d78] animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
          
          <div ref={bottomRef} />
        </div>
      )}

    </div>
  );
}
