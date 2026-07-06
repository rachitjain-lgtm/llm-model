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
  File,
  Mic,
  MicOff,
  Square,
  Globe,
  UserCheck
} from "lucide-react";
import { AI_PERSONAS } from "../config/models";
import { 
  addMessage, 
  setLoading, 
  updateLastMessageText, 
  addSourceToLastMessage,
  setLastMessageSources,
  updateChatSettings,
  renameChat,
  renameChatAsync
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
  const streamingOn = true;

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const baseTextRef = useRef("");

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    baseTextRef.current = inputText;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      const base = baseTextRef.current ? baseTextRef.current.trim() : "";
      const spoken = (finalTranscript + interimTranscript).trim();
      const combined = base ? `${base} ${spoken}` : spoken;
      setInputText(combined);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

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

  const abortControllerRef = useRef(null);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      dispatch(setLoading(false));
    }
  };

  // Process files selected via file input or drop
  const handleAddFiles = async (files) => {
    const fileArray = Array.from(files);
    const newAttachments = await Promise.all(
      fileArray.map(async (file) => {
        const isImage = file.type.startsWith("image/");
        let textContent = null;
        if (!isImage && (file.type.startsWith("text/") || file.name.match(/\.(txt|md|json|js|jsx|ts|tsx|py|csv|html|css|sql|xml|yaml|yml)$/i))) {
          try {
            textContent = await file.text();
          } catch (e) {
            console.error("Could not read text content from file:", e);
          }
        }

        return {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
          isImage,
          textContent,
          previewUrl: isImage ? URL.createObjectURL(file) : null
        };
      })
    );
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

    // Auto-update generic title to user's first prompt headline
    const isGenericTitle = !activeChat.title || activeChat.title === "New Conversation" || activeChat.title === "New chat";
    const shouldUpdateTitle = (activeChat.messages.length === 0 || isGenericTitle) && userMessageText;

    if (shouldUpdateTitle) {
      const cleanTitle = userMessageText.split("\n")[0].slice(0, 45).trim() || "New Conversation";
      dispatch(renameChatAsync({
        id: activeChat.id,
        title: cleanTitle
      }));
    }

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

    // Construct prompt sent to API including attachment names and text contents
    let fullPrompt = userMessageText;
    if (currentAttachments.length > 0) {
      const fileListStr = currentAttachments.map(a => {
        let str = `[Attached File: ${a.name} (${a.size})]`;
        if (a.textContent) {
          str += `\n\n--- Start of File (${a.name}) ---\n${a.textContent}\n--- End of File (${a.name}) ---`;
        }
        return str;
      }).join("\n\n");
      fullPrompt = userMessageText ? `${userMessageText}\n\n${fileListStr}` : fileListStr;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      chatApi.saveMessage(activeChat.id, {
        sender: "user",
        content: fullPrompt
      }).catch((err) => console.error("Failed to save user message to DB:", err));

      await chatApi.sendMessageStream({
        conversation: activeChat,
        prompt: fullPrompt,
        streamingOn,
        activeKb,
        signal: controller.signal
      }, (chunk) => {
        dispatch(updateLastMessageText({ chatId: activeChat.id, text: chunk }));
      }, (finalText, sources) => {
        dispatch(updateLastMessageText({ chatId: activeChat.id, text: finalText }));
        chatApi.saveMessage(activeChat.id, {
          sender: "assistant",
          content: finalText
        }).catch((err) => console.error("Failed to save assistant message to DB:", err));
        if (sources && sources.length > 0) {
          dispatch(setLastMessageSources({ chatId: activeChat.id, sources }));
        }
        dispatch(setLoading(false));
        abortControllerRef.current = null;
      });
    } catch (error) {
      if (error.name === "AbortError") {
        dispatch(updateLastMessageText({
          chatId: activeChat.id,
          text: `*[Generation stopped by user]*`
        }));
      } else {
        dispatch(updateLastMessageText({
          chatId: activeChat.id,
          text: `Request failed for **${getModelLabel(activeChat.model)}**.
${error.message}

If you're using a free model, double-check that the model ID is still available and that your OpenRouter API key is valid.`
        }));
      }
      dispatch(setLoading(false));
      abortControllerRef.current = null;
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

            {/* Voice Input Microphone Button */}
            <button 
              type="button"
              onClick={toggleVoiceInput}
              className={`h-9 px-3 rounded-xl flex items-center gap-2 text-[11px] font-semibold transition-all cursor-pointer border ${
                isListening 
                  ? "bg-rose-500 text-white border-rose-600 animate-pulse shadow-md" 
                  : "bg-transparent border-transparent hover:bg-[#FAFAFA] dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:text-[#eceff1]"
              }`}
              title={isListening ? "Listening... Click to stop" : "Start Voice Input"}
            >
              {isListening ? <MicOff size={14} className="text-white" /> : <Mic size={14} />}
              <span>{isListening ? "Listening..." : "Voice Input"}</span>
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

          {/* Right Tools Controls + Send / Stop */}
          <div className="flex items-center gap-2">
            {isLoading ? (
              <button 
                onClick={handleStopGeneration}
                className="w-9 h-9 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white transition-all cursor-pointer shadow-md"
                title="Stop generating response"
              >
                <Square size={13} className="fill-white" />
              </button>
            ) : (
              <button 
                onClick={handleSend}
                disabled={!inputText.trim() && attachments.length === 0}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all cursor-pointer shadow-sm
                  ${(inputText.trim() || attachments.length > 0) 
                    ? "bg-[#245955] dark:bg-[#347d78] hover:bg-[#1d4643] dark:hover:bg-[#2b6763]" 
                    : "bg-slate-200 dark:bg-zinc-800 cursor-not-allowed text-slate-400 dark:text-zinc-600"}`}
              >
                <Send size={14} className={(inputText.trim() || attachments.length > 0) ? "translate-x-0.5 -translate-y-0.5 rotate-45" : ""} />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Disclaimers footnote */}
      <div className="text-[10px] text-[#A3A3A3] dark:text-[#64748B] text-center mt-3 select-none transition-colors">
        AI Studio can make mistakes. Check important info.
      </div>
    </div>
  );
}


