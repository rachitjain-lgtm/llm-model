import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Check, 
  ExternalLink,
  Info,
  Paperclip,
  FileText,
  Image as ImageIcon,
  FileCode,
  File,
  Edit2,
  X as XIcon
} from "lucide-react";
import { editMessage, setLoading, addMessage } from "../store/chatSlice";
import { chatApi } from "../api/chatApi";

export default function MessageBubble({ message }) {
  const dispatch = useDispatch();
  const activeId = useSelector((state) => state.chat.activeConversationId);
  const conversations = useSelector((state) => state.chat.conversations);
  const activeChat = conversations.find((c) => c.id === activeId);

  const { id, sender, text, time, initials, sources, attachments } = message;
  const [copied, setCopied] = useState(false);
  const [voted, setVoted] = useState(null); // 'up' or 'down'

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    const trimmedText = editText.trim();
    if (!trimmedText) return;

    setIsEditing(false);

    if (trimmedText !== text) {
      // 1. Update the user message
      dispatch(editMessage({ chatId: activeId, messageId: id, newText: trimmedText }));

      // 2. Find and update/regenerate the corresponding assistant response
      if (activeChat && activeChat.messages) {
        const msgIndex = activeChat.messages.findIndex((m) => m.id === id);
        const nextMsg = activeChat.messages[msgIndex + 1];

        if (nextMsg && nextMsg.sender === "assistant") {
          // Update existing assistant response stream
          dispatch(setLoading(true));
          chatApi.sendMessageStream(
            activeId,
            trimmedText,
            activeChat.model || "Claude 3 Sonnet",
            activeChat.useKnowledgeBase,
            (chunk) => {
              dispatch(editMessage({ chatId: activeId, messageId: nextMsg.id, newText: chunk }));
            },
            (finalText) => {
              dispatch(editMessage({ chatId: activeId, messageId: nextMsg.id, newText: finalText }));
              dispatch(setLoading(false));
            }
          );
        } else {
          // If no assistant message follows, create new assistant response & stream
          const assistantMsgId = `msg-${Date.now()}-assistant`;
          const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

          dispatch(
            addMessage({
              chatId: activeId,
              message: {
                id: assistantMsgId,
                sender: "assistant",
                text: "",
                time: timeStr,
                sources: null
              }
            })
          );

          dispatch(setLoading(true));
          chatApi.sendMessageStream(
            activeId,
            trimmedText,
            activeChat.model || "Claude 3 Sonnet",
            activeChat.useKnowledgeBase,
            (chunk) => {
              dispatch(editMessage({ chatId: activeId, messageId: assistantMsgId, newText: chunk }));
            },
            (finalText) => {
              dispatch(editMessage({ chatId: activeId, messageId: assistantMsgId, newText: finalText }));
              dispatch(setLoading(false));
            }
          );
        }
      }
    }
  };

  const handleCancelEdit = () => {
    setEditText(text);
    setIsEditing(false);
  };

  const renderFileIcon = (att) => {
    if (att.isImage) return <ImageIcon size={14} className="text-emerald-600 dark:text-emerald-400" />;
    if (att.name?.endsWith(".json") || att.name?.endsWith(".js") || att.name?.endsWith(".py") || att.name?.endsWith(".html") || att.name?.endsWith(".css")) {
      return <FileCode size={14} className="text-blue-500 dark:text-blue-400" />;
    }
    if (att.name?.endsWith(".pdf") || att.name?.endsWith(".txt") || att.name?.endsWith(".md") || att.name?.endsWith(".doc")) {
      return <FileText size={14} className="text-amber-500 dark:text-amber-400" />;
    }
    return <File size={14} className="text-teal-600 dark:text-teal-400" />;
  };

  // Helper for inline styles (bold, links)
  const parseInlineStyles = (lineText) => {
    const parts = [];
    let currentIndex = 0;
    
    // Match bold **text** or Markdown links [title](url)
    const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
    const matches = [...lineText.matchAll(regex)];
    
    if (matches.length === 0) {
      return lineText;
    }
    
    matches.forEach((match, index) => {
      const matchIndex = match.index;
      const matchText = match[0];
      
      // Add text before match
      if (matchIndex > currentIndex) {
        parts.push(lineText.slice(currentIndex, matchIndex));
      }
      
      if (matchText.startsWith("**") && matchText.endsWith("**")) {
        parts.push(
          <strong key={index} className="font-semibold text-[#171717] dark:text-[#eceff1] transition-colors">
            {matchText.slice(2, -2)}
          </strong>
        );
      } else if (matchText.startsWith("[") && matchText.includes("](")) {
        const title = matchText.slice(1, matchText.indexOf("]("));
        const url = matchText.slice(matchText.indexOf("](") + 2, -1);
        parts.push(
          <a 
            key={index} 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[#245955] dark:text-[#347d78] hover:text-[#1d4643] dark:hover:text-[#2b6763] font-semibold underline inline-flex items-center gap-0.5 transition-colors"
          >
            {title}
          </a>
        );
      }
      
      currentIndex = matchIndex + matchText.length;
    });
    
    if (currentIndex < lineText.length) {
      parts.push(lineText.slice(currentIndex));
    }
    
    return parts;
  };
 
  // Main Markdown parsing logic
  const renderContent = (content) => {
    if (!content) return null;
    
    // Split code blocks out
    const blocks = content.split(/(```[\s\S]*?```)/g);
    
    return blocks.map((block, idx) => {
      if (block.startsWith("```")) {
        const codeLines = block.split("\n");
        const language = codeLines[0].replace("```", "").trim();
        const code = codeLines.slice(1, -1).join("\n");
        return (
          <pre key={idx} className="bg-[#FAFAFA] dark:bg-[#1E2326] border border-[#E7E7E7] dark:border-[#23272A] rounded-xl p-4 font-mono text-[11px] overflow-x-auto my-3 text-[#171717] dark:text-[#eceff1] leading-relaxed shadow-sm transition-colors">
            <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-[#A3A3A3] dark:text-[#64748B] mb-2 font-sans select-none border-b border-[#E7E7E7] dark:border-[#23272A] pb-1 transition-colors">
              <span>{language || "code"}</span>
            </div>
            <code>{code}</code>
          </pre>
        );
      }
      
      // Process standard blocks line by line
      const lines = block.split("\n");
      return (
        <div key={idx} className="space-y-3">
          {lines.map((line, lineIdx) => {
            // Headers
            if (line.startsWith("### ")) {
              return <h4 key={lineIdx} className="text-xs font-bold text-[#171717] dark:text-[#eceff1] mt-4 font-montserrat transition-colors">{line.slice(4)}</h4>;
            }
            if (line.startsWith("## ")) {
              return <h3 key={lineIdx} className="text-sm font-bold text-[#171717] dark:text-[#eceff1] mt-5 font-montserrat transition-colors">{line.slice(3)}</h3>;
            }
            if (line.startsWith("# ")) {
              return <h2 key={lineIdx} className="text-base font-bold text-[#171717] dark:text-[#eceff1] mt-6 font-montserrat transition-colors">{line.slice(2)}</h2>;
            }
            
            // Bullet Lists
            if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
              const cleanLine = line.trim().slice(2);
              return (
                <ul key={lineIdx} className="list-disc list-inside pl-4 text-xs leading-relaxed text-[#171717] dark:text-[#eceff1] space-y-1 transition-colors">
                  <li>{parseInlineStyles(cleanLine)}</li>
                </ul>
              );
            }
            
            // Numbered Lists
            if (/^\d+\.\s/.test(line.trim())) {
              const match = line.trim().match(/^(\d+)\.\s(.*)/);
              if (match) {
                return (
                  <ol key={lineIdx} className="list-decimal list-inside pl-4 text-xs leading-relaxed text-[#171717] dark:text-[#eceff1] space-y-1 transition-colors">
                    <li value={parseInt(match[1])}>{parseInlineStyles(match[2])}</li>
                  </ol>
                );
              }
            }
            
            // Empty line spacer
            if (line.trim() === "") {
              return <div key={lineIdx} className="h-1" />;
            }
            
            // Normal paragraph text
            return (
              <p key={lineIdx} className="text-xs leading-relaxed text-[#171717] dark:text-[#eceff1] text-justify font-sans transition-colors">
                {parseInlineStyles(line)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  const isUser = sender === "user";

  return (
    <div className={`flex w-full items-start gap-4 mb-6 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      
      {/* Avatar */}
      {isUser ? (
        <div className="w-8 h-8 rounded-full bg-[#185e59] text-white flex items-center justify-center text-xs font-bold font-montserrat flex-shrink-0 shadow-sm select-none">
          {initials || "AR"}
        </div>
      ) : (
        <div className="w-8 h-8 rounded bg-[#245955] text-white flex items-center justify-center text-sm font-bold font-montserrat flex-shrink-0 shadow-sm select-none">
          B
        </div>
      )}

      {/* Message Bubble Column */}
      <div className={`flex flex-col max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        
        {/* Main Text Content / Edit Mode */}
        <div className={`px-5 py-4 rounded-2xl shadow-sm transition-colors duration-200 min-w-[240px] ${
          isUser 
            ? "bg-[#FAFAFA] dark:bg-[#1E2326] text-[#171717] dark:text-[#eceff1] rounded-tr-none border border-[#E7E7E7] dark:border-[#23272A]" 
            : "bg-white dark:bg-[#16191B] text-[#171717] dark:text-[#eceff1] rounded-tl-none border border-[#E7E7E7] dark:border-[#23272A]"
        }`}>
          {/* Render Attached Files if any */}
          {attachments && attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map((att, i) => (
                <div key={i} className="flex items-center gap-2 bg-white dark:bg-[#141719] border border-[#E7E7E7] dark:border-[#282d31] p-2 rounded-xl text-xs shadow-sm">
                  {att.isImage && att.previewUrl ? (
                    <img src={att.previewUrl} alt={att.name} className="max-h-32 object-cover rounded-lg border border-black/10" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-[#F5F7F7] dark:bg-[#1A1D20] flex items-center justify-center">
                        {renderFileIcon(att)}
                      </div>
                      <div className="flex flex-col pr-1">
                        <span className="font-semibold text-[11px] text-[#171717] dark:text-[#eceff1]">{att.name}</span>
                        <span className="text-[9px] text-[#737373] dark:text-[#94A3B8]">{att.size}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {isEditing ? (
            <div className="space-y-3 w-full">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    handleSaveEdit();
                  }
                  if (e.key === "Escape") {
                    handleCancelEdit();
                  }
                }}
                className="w-full min-h-[80px] p-3 bg-white dark:bg-[#16191B] border border-[#245955] dark:border-[#347d78] rounded-xl text-xs text-[#171717] dark:text-[#eceff1] focus:outline-none resize-y"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#737373] dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-[#262B2E] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <XIcon size={12} />
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3.5 py-1.5 bg-[#245955] dark:bg-[#347d78] hover:bg-[#1d4643] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Check size={12} />
                  Save
                </button>
              </div>
            </div>
          ) : (
            renderContent(text)
          )}

          {/* Sources section */}
          {sources && sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#E7E7E7] dark:border-[#23272A] space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#A3A3A3] dark:text-[#64748B] uppercase tracking-wider select-none">
                <Info size={12} />
                <span>Sources</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 px-3.5 py-2 bg-[#F5F7F7] dark:bg-[#0f1214] hover:bg-[#E7F3F1] dark:hover:bg-[#183331] border border-[#E7E7E7] dark:border-[#23272A] rounded-lg transition-colors group cursor-pointer"
                  >
                    <span className="text-[11px] font-semibold text-[#245955] dark:text-[#347d78]">{src.title}</span>
                    <ExternalLink size={12} className="text-[#737373] dark:text-[#94A3B8] group-hover:text-[#245955] dark:group-hover:text-[#347d78] transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action icons / timestamp row */}
        <div className="flex items-center gap-3 mt-2 px-1 text-[10px] text-[#A3A3A3] dark:text-[#64748B] select-none">
          <span>{time}</span>

          {/* Edit button ONLY for User input messages */}
          {isUser && !isEditing && (
            <button
              onClick={() => {
                setEditText(text);
                setIsEditing(true);
              }}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#23272A] hover:text-[#171717] dark:hover:text-[#eceff1] transition-all cursor-pointer text-[#737373] dark:text-[#94A3B8] flex items-center gap-1"
              title="Edit prompt"
            >
              <Edit2 size={12} />
              <span>Edit</span>
            </button>
          )}

          {!isUser && (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleCopy}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#23272A] hover:text-[#171717] dark:hover:text-[#eceff1] transition-all cursor-pointer text-[#737373] dark:text-[#94A3B8]"
                title="Copy response"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              </button>
              <button 
                onClick={() => setVoted("up")}
                className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-[#23272A] hover:text-emerald-500 dark:hover:text-emerald-400 transition-all cursor-pointer ${voted === "up" ? "text-emerald-500 dark:text-emerald-400 bg-slate-100 dark:bg-[#23272A]" : "text-[#737373] dark:text-[#94A3B8]"}`}
                title="Helpful"
              >
                <ThumbsUp size={12} />
              </button>
              <button 
                onClick={() => setVoted("down")}
                className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-[#23272A] hover:text-rose-500 dark:hover:text-rose-400 transition-all cursor-pointer ${voted === "down" ? "text-rose-500 dark:text-rose-400 bg-slate-100 dark:bg-[#23272A]" : "text-[#737373] dark:text-[#94A3B8]"}`}
                title="Not helpful"
              >
                <ThumbsDown size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
