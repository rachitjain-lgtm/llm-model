import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Paperclip, 
  Database, 
  Shield, 
  BookOpen, 
  Send, 
  SlidersHorizontal,
  Check,
  Search,
  X,
  FileText,
  Image as ImageIcon,
  FileCode,
  File
} from "lucide-react";
import { 
  addMessage, 
  setLoading, 
  updateLastMessageText, 
  addSourceToLastMessage,
  updateChatSettings,
  renameChat
} from "../store/chatSlice";
import { 
  toggleRightPanel, 
  setActiveKbId, 
  toggleKbDropdown, 
  setKbDropdownOpen,
  setPromptLibraryModalOpen 
} from "../store/uiSlice";
import { chatApi } from "../api/chatApi";
import { getModelLabel } from "../config/models";

const createMessageId = (suffix) => {
  if (globalThis.crypto?.randomUUID) {
    return `msg-${globalThis.crypto.randomUUID()}-${suffix}`;
  }

  return `msg-${Math.random().toString(36).slice(2, 10)}-${suffix}`;
};

export default function PromptComposer() {
  const dispatch = useDispatch();
  const activeId = useSelector(state => state.chat.activeConversationId);
  const conversations = useSelector(state => state.chat.conversations);
  const activeChat = conversations.find(c => c.id === activeId);
  const isLoading = useSelector(state => state.chat.isLoading);
  const streamingOn = useSelector(state => state.chat.streamingOn);

  const kbDropdownOpen = useSelector(state => state.ui.kbDropdownOpen);
  const activeKbId = useSelector(state => state.ui.activeKbId);

  const [inputText, setInputText] = useState("");
  const [kbSearch, setKbSearch] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const kbRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

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

  // Listen for prompt library insertion events to fill input box
  useEffect(() => {
    const handleInsertPrompt = (e) => {
      if (e.detail) {
        setInputText(e.detail);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(e.detail.length, e.detail.length);
          }
        }, 50);
      }
    };
    window.addEventListener("insert-prompt", handleInsertPrompt);
    return () => window.removeEventListener("insert-prompt", handleInsertPrompt);
  }, []);

  if (!activeChat) return null;

  // Helper to format bytes
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Process files selected via file input or drop
  const handleAddFiles = (files) => {
    const newAttachments = Array.from(files).map((file) => {
      const isImage = file.type.startsWith("image/");
      return {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        isImage,
        previewUrl: isImage ? URL.createObjectURL(file) : null
      };
    });
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(e.target.files);
      e.target.value = ""; // reset input
    }
  };

  const removeAttachment = (id) => {
    setAttachments(prev => {
      const itemToRemove = prev.find(a => a.id === id);
      if (itemToRemove && itemToRemove.previewUrl) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  const handleSend = async () => {
    if ((!inputText.trim() && attachments.length === 0) || isLoading) return;

    const userMessageText = inputText.trim();
    const currentAttachments = [...attachments];

    setInputText("");
    setAttachments([]);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Add User Message (with attachments if any)
    dispatch(addMessage({
      chatId: activeChat.id,
      message: {
        id: createMessageId("user"),
        sender: "user",
        text: userMessageText,
        time: timeStr,
        initials: "AR",
        attachments: currentAttachments
      }
    }));

    if (activeChat.messages.length === 0 && userMessageText) {
      dispatch(renameChat({
        id: activeChat.id,
        title: userMessageText.slice(0, 48)
      }));
    }

    // 2. Set loading state
    dispatch(setLoading(true));

    // 3. Add blank assistant bubble to stream into
    const assistantMsgId = createMessageId("assistant");
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

    // Construct prompt sent to API including attachment names
    let fullPrompt = userMessageText;
    if (currentAttachments.length > 0) {
      const fileListStr = currentAttachments.map(a => `[Attached File: ${a.name} (${a.size})]`).join("\n");
      fullPrompt = userMessageText ? `${userMessageText}\n\n${fileListStr}` : fileListStr;
    }

    try {
      chatApi.saveMessage(activeChat.id, {
        sender: "user",
        content: fullPrompt
      }).catch((err) => console.error("Failed to save user message to DB:", err));

      await chatApi.sendMessageStream({
        conversation: activeChat,
        prompt: fullPrompt,
        streamingOn,
        activeKb
      }, (chunk) => {
        dispatch(updateLastMessageText({ chatId: activeChat.id, text: chunk }));
      }, (finalText, sources) => {
        dispatch(updateLastMessageText({ chatId: activeChat.id, text: finalText }));
        chatApi.saveMessage(activeChat.id, {
          sender: "assistant",
          content: finalText
        }).catch((err) => console.error("Failed to save assistant message to DB:", err));
        if (sources) {
          sources.forEach(src => {
            dispatch(addSourceToLastMessage({ chatId: activeChat.id, source: src }));
          });
        }
        dispatch(setLoading(false));
      });
    } catch (error) {
      dispatch(updateLastMessageText({
        chatId: activeChat.id,
        text: `Request failed for **${getModelLabel(activeChat.model)}**.
${error.message}

If you're using a free model, double-check that the model ID is still available and that your OpenRouter API key is valid.`
      }));
      dispatch(setLoading(false));
    }
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

  const renderFileIcon = (att) => {
    if (att.isImage) return <ImageIcon size={14} className="text-emerald-600 dark:text-emerald-400" />;
    if (att.name.endsWith(".json") || att.name.endsWith(".js") || att.name.endsWith(".py") || att.name.endsWith(".html") || att.name.endsWith(".css")) {
      return <FileCode size={14} className="text-blue-500 dark:text-blue-400" />;
    }
    if (att.name.endsWith(".pdf") || att.name.endsWith(".txt") || att.name.endsWith(".md") || att.name.endsWith(".doc")) {
      return <FileText size={14} className="text-amber-500 dark:text-amber-400" />;
    }
    return <File size={14} className="text-teal-600 dark:text-teal-400" />;
  };

  return (
    <div className="p-4 md:p-6 border-t border-[#E7E7E7] dark:border-[#23272A] bg-white dark:bg-[#16191B] flex flex-col flex-shrink-0 select-none transition-colors duration-200">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        multiple 
        className="hidden" 
      />

      {/* Compose Area Container */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border rounded-2xl bg-white dark:bg-[#1E2326] shadow-sm flex flex-col p-3 transition-all duration-200
          ${isDragging 
            ? "border-[#245955] dark:border-[#347d78] ring-2 ring-[#245955]/20 dark:ring-[#347d78]/20 bg-[#E7F3F1]/30 dark:bg-[#183331]/30" 
            : "border-[#E7E7E7] dark:border-[#23272A]"}`}
      >
        
        {/* Attachment Chips Preview Container */}
        {attachments.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 border-b border-[#F0F0F0] dark:border-[#282d31]">
            {attachments.map((att) => (
              <div 
                key={att.id} 
                className="flex items-center gap-2 bg-[#F5F7F7] dark:bg-[#0f1214] border border-[#E7E7E7] dark:border-[#282d31] px-2.5 py-1.5 rounded-xl text-xs text-[#171717] dark:text-[#eceff1] flex-shrink-0 group transition-colors"
              >
                {att.isImage && att.previewUrl ? (
                  <img 
                    src={att.previewUrl} 
                    alt={att.name} 
                    className="w-7 h-7 object-cover rounded-md border border-black/10 dark:border-white/10" 
                  />
                ) : (
                  <div className="w-7 h-7 rounded-md bg-white dark:bg-[#1A1D20] border border-[#E7E7E7] dark:border-[#23272A] flex items-center justify-center">
                    {renderFileIcon(att)}
                  </div>
                )}
                
                <div className="flex flex-col min-w-0 max-w-[140px]">
                  <span className="truncate text-[11px] font-semibold">{att.name}</span>
                  <span className="text-[9px] text-[#737373] dark:text-[#94A3B8]">{att.size}</span>
                </div>

                <button 
                  onClick={() => removeAttachment(att.id)}
                  className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-[#282d31] text-[#737373] hover:text-rose-500 dark:hover:text-rose-400 transition-all cursor-pointer"
                  title="Remove attachment"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Input area */}
        <textarea
          ref={textareaRef}
          rows={2}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${getModelLabel(activeChat.model)}... (Drag & drop or attach files)`}
          className="w-full resize-none bg-transparent text-xs text-[#171717] dark:text-[#eceff1] placeholder-[#A3A3A3] dark:placeholder-[#64748B] focus:outline-none p-1 font-sans font-medium transition-colors"
        />

        {/* Action Row */}
        <div className="flex items-center justify-between border-t border-[#FAFAFA] dark:border-[#23272A] pt-2 mt-2">
          
          {/* Quick Buttons Left */}
          <div className="flex items-center gap-1.5 flex-wrap">
            
            {/* Attachment Button */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-3 hover:bg-[#FAFAFA] dark:hover:bg-[#23272A] border border-transparent hover:border-[#E7E7E7] dark:hover:border-[#23272A] rounded-xl flex items-center gap-2 text-[11px] font-semibold text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:text-[#eceff1] transition-all cursor-pointer relative"
              title="Attach files or images"
            >
              <Paperclip size={14} />
              <span>Attach</span>
              {attachments.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#245955] dark:bg-[#347d78] text-white text-[9px] font-bold flex items-center justify-center">
                  {attachments.length}
                </span>
              )}
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
            <button 
              onClick={() => dispatch(setPromptLibraryModalOpen(true))}
              className="h-9 px-3 hover:bg-[#FAFAFA] dark:hover:bg-[#23272A] border border-transparent hover:border-[#E7E7E7] dark:border-[#23272A] rounded-xl flex items-center gap-2 text-[11px] font-semibold text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:text-[#eceff1] transition-all cursor-pointer"
            >
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
              disabled={(!inputText.trim() && attachments.length === 0) || isLoading}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all cursor-pointer shadow-sm
                ${(inputText.trim() || attachments.length > 0) && !isLoading 
                  ? "bg-[#245955] dark:bg-[#347d78] hover:bg-[#1d4643] dark:hover:bg-[#2b6763]" 
                  : "bg-slate-200 dark:bg-zinc-800 cursor-not-allowed text-slate-400 dark:text-zinc-600"}`}
            >
              <Send size={14} className={(inputText.trim() || attachments.length > 0) ? "translate-x-0.5 -translate-y-0.5 rotate-45" : ""} />
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


