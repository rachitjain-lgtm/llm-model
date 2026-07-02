import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  X, 
  Search, 
  BookOpen, 
  Code2, 
  PenTool, 
  BarChart2, 
  Sparkles, 
  Briefcase,
  Copy,
  Check,
  ArrowUpRight
} from "lucide-react";
import { togglePromptLibraryModal } from "../store/uiSlice";
import { addMessage, setLoading, updateLastMessageText, addSourceToLastMessage } from "../store/chatSlice";
import { chatApi } from "../api/chatApi";

const PROMPT_TEMPLATES = [
  {
    id: "prompt-1",
    title: "Code Review & Refactoring",
    category: "Coding",
    icon: Code2,
    description: "Analyze code for performance bugs, security vulnerabilities, and readability improvements.",
    promptText: "Please review the following code for potential security vulnerabilities, performance bottlenecks, and best practices refactoring suggestions:\n\n```js\n// Paste your code here\n```"
  },
  {
    id: "prompt-2",
    title: "SQL Query Generator",
    category: "Coding",
    icon: Code2,
    description: "Generate efficient SQL queries with JOINs, aggregations, and performance index tips.",
    promptText: "Write an optimized SQL query to retrieve all active users who have placed more than 3 orders in the past 30 days, along with their total spend and latest order date."
  },
  {
    id: "prompt-3",
    title: "B2B SaaS Marketing Strategy",
    category: "Writing",
    icon: PenTool,
    description: "Brainstorm 5 high-converting marketing campaigns for launching a tech SaaS product.",
    promptText: "Provide 5 creative, high-converting launch campaign ideas for a new B2B AI SaaS product targeting software engineers and engineering managers."
  },
  {
    id: "prompt-4",
    title: "Executive Email Summary",
    category: "Writing",
    icon: PenTool,
    description: "Draft a concise, high-impact executive status update email for stakeholders.",
    promptText: "Draft a professional executive weekly status email summarizing milestone accomplishments, risks, and next week's key deliverables for the AI Studio release."
  },
  {
    id: "prompt-5",
    title: "Root Cause & Data Analysis",
    category: "Analysis",
    icon: BarChart2,
    description: "Perform systematic root cause breakdown for unexpected metrics drop or system error.",
    promptText: "Our API latency spiked by 40% after the last deployment. Provide a step-by-step diagnostic framework and root cause analysis checklist to investigate this issue."
  },
  {
    id: "prompt-6",
    title: "Competitive Feature Matrix",
    category: "Analysis",
    icon: BarChart2,
    description: "Create a comparative feature breakdown matrix evaluating industry competitors.",
    promptText: "Generate a detailed comparison matrix comparing top cloud LLM APIs (OpenAI, Anthropic Claude, Google Gemini, AWS Bedrock) across pricing, context length, latency, and enterprise security."
  },
  {
    id: "prompt-7",
    title: "Product Specs & User Stories",
    category: "Productivity",
    icon: Briefcase,
    description: "Write structured product requirements and acceptance criteria for a new feature.",
    promptText: "Write a Product Requirement Document (PRD) draft for 'Role-Based Access Control (RBAC)', including user stories, technical acceptance criteria, and edge cases."
  },
  {
    id: "prompt-8",
    title: "Creative Brainstorming & Naming",
    category: "Creative",
    icon: Sparkles,
    description: "Generate creative product names, taglines, and brand positioning ideas.",
    promptText: "Brainstorm 10 catchy, futuristic product names and taglines for an AI-powered code assistant designed for enterprise developers."
  }
];

const CATEGORIES = ["All", "Coding", "Writing", "Analysis", "Productivity", "Creative"];

export default function PromptLibraryModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.ui.promptLibraryModalOpen);
  const activeId = useSelector((state) => state.chat.activeConversationId);
  const conversations = useSelector((state) => state.chat.conversations);
  const activeChat = conversations.find((c) => c.id === activeId);
  const isLoading = useSelector((state) => state.chat.isLoading);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen) return null;

  const filteredPrompts = PROMPT_TEMPLATES.filter((p) => {
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.promptText.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (id, text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUsePrompt = (promptText) => {
    dispatch(togglePromptLibraryModal());

    if (!activeChat || isLoading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    dispatch(addMessage({
      chatId: activeChat.id,
      message: {
        id: `msg-${Date.now()}-user`,
        sender: "user",
        text: promptText,
        time: timeStr,
        initials: "AR"
      }
    }));

    dispatch(setLoading(true));

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

    chatApi.sendMessageStream(
      activeChat.id,
      promptText,
      activeChat.model,
      activeChat.useKnowledgeBase,
      (chunk) => {
        dispatch(updateLastMessageText({ chatId: activeChat.id, text: chunk }));
      },
      (finalText, sources) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      
      <div className="bg-white dark:bg-[#16191B] border border-[#E7E7E7] dark:border-[#23272A] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E7E7E7] dark:border-[#23272A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E7F3F1] dark:bg-[#183331] text-[#245955] dark:text-[#347d78] flex items-center justify-center font-bold">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#171717] dark:text-[#eceff1] font-montserrat">
                Prompt Library
              </h2>
              <p className="text-xs text-[#737373] dark:text-[#94A3B8]">
                Select from pre-engineered prompts to launch AI workflows
              </p>
            </div>
          </div>

          <button 
            onClick={() => dispatch(togglePromptLibraryModal())}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:text-[#eceff1] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search and Categories */}
        <div className="p-5 border-b border-[#E7E7E7] dark:border-[#23272A] space-y-4 bg-[#FAFAFA] dark:bg-[#0f1214] transition-colors">
          
          {/* Search bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373] dark:text-[#94A3B8]" />
            <input 
              type="text"
              placeholder="Search prompt templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white dark:bg-[#1E2326] border border-[#E7E7E7] dark:border-[#23272A] text-xs text-[#171717] dark:text-[#eceff1] rounded-xl placeholder-[#A3A3A3] dark:placeholder-[#64748B] focus:outline-none focus:border-[#245955] dark:focus:border-[#347d78] shadow-xs transition-colors"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCategory === cat
                    ? "bg-[#245955] dark:bg-[#347d78] text-white border-transparent shadow-xs"
                    : "bg-white dark:bg-[#1E2326] text-[#737373] dark:text-[#94A3B8] border-[#E7E7E7] dark:border-[#23272A] hover:text-[#171717] dark:hover:text-[#eceff1]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Cards Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrompts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-[#737373] dark:text-[#94A3B8]">
              No prompts found matching your search.
            </div>
          ) : (
            filteredPrompts.map((p) => {
              const IconComp = p.icon;
              return (
                <div 
                  key={p.id}
                  className="group p-4 bg-white dark:bg-[#1E2326] border border-[#E7E7E7] dark:border-[#23272A] hover:border-[#245955] dark:hover:border-[#347d78] rounded-xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#E7F3F1] dark:bg-[#183331] text-[#245955] dark:text-[#347d78]">
                          <IconComp size={14} />
                        </div>
                        <span className="text-[11px] font-bold uppercase text-[#245955] dark:text-[#347d78]">
                          {p.category}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleCopy(p.id, p.promptText, e)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#282d31] text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:text-[#eceff1] transition-colors cursor-pointer"
                        title="Copy prompt text"
                      >
                        {copiedId === p.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <h3 className="text-xs font-bold text-[#171717] dark:text-[#eceff1] font-montserrat mb-1">
                      {p.title}
                    </h3>
                    <p className="text-[11px] text-[#737373] dark:text-[#94A3B8] leading-relaxed mb-3">
                      {p.description}
                    </p>

                    <div className="p-2.5 rounded-lg bg-[#F5F7F7] dark:bg-[#0f1214] border border-[#E7E7E7] dark:border-[#23272A] text-[10px] text-[#737373] dark:text-[#94A3B8] font-mono line-clamp-2 italic mb-3">
                      "{p.promptText}"
                    </div>
                  </div>

                  <button
                    onClick={() => handleUsePrompt(p.promptText)}
                    className="w-full py-2 px-3 bg-[#E7F3F1] dark:bg-[#183331] hover:bg-[#245955] dark:hover:bg-[#347d78] text-[#245955] dark:text-[#347d78] hover:text-white dark:hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Use Prompt</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E7E7E7] dark:border-[#23272A] bg-[#FAFAFA] dark:bg-[#0f1214] flex justify-end">
          <button
            onClick={() => dispatch(togglePromptLibraryModal())}
            className="px-4 py-2 bg-slate-200 dark:bg-zinc-800 text-[#171717] dark:text-[#eceff1] text-xs font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
