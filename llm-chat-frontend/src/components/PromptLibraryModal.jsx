import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { X, Search, BookOpen, Sparkles, Code, Database, FileText, Share2, Check } from "lucide-react";
import { setPromptLibraryModalOpen } from "../store/uiSlice";

const PROMPT_TEMPLATES = [
  {
    id: "p1",
    category: "Coding & Engineering",
    icon: Code,
    title: "SQL Query Generator",
    description: "Write an optimized SQL query with joins and filtering.",
    prompt: "Write an optimized SQL query to find users who signed up in the last 30 days and spent over $100. Include table aliases and sum calculations."
  },
  {
    id: "p2",
    category: "Coding & Engineering",
    icon: Code,
    title: "Refactor & Optimize Function",
    description: "Review a function for clean code, performance, and edge cases.",
    prompt: "Please review the following code snippet. Suggest performance optimizations, improve error handling, and rewrite it cleanly with async/await:\n\n```js\n// Paste code here\n```"
  },
  {
    id: "p3",
    category: "Data Analysis & RAG",
    icon: Database,
    title: "Explain RAG Architecture",
    description: "Deep dive into Retrieval-Augmented Generation workflow.",
    prompt: "Explain how Retrieval-Augmented Generation (RAG) works on Cloud AI platforms. Detail document chunking, vector embeddings, semantic search, and prompt augmentation."
  },
  {
    id: "p4",
    category: "Data Analysis & RAG",
    icon: Database,
    title: "Summarize Knowledge Base Docs",
    description: "Synthesize product docs into clear executive key points.",
    prompt: "Please analyze the attached Knowledge Base document and provide:\n1. Executive Summary\n2. Key Architecture Decisions\n3. Action items for engineering teams."
  },
  {
    id: "p5",
    category: "Marketing & Strategy",
    icon: Share2,
    title: "B2B Launch Campaign Ideas",
    description: "Generate 5 high-impact creative strategies for product launch.",
    prompt: "List 5 creative marketing campaign ideas for a B2B SaaS platform launch. Focus on interactive tools, leader roundtables, and developer content marketing."
  },
  {
    id: "p6",
    category: "Writing & Summarization",
    icon: FileText,
    title: "Model Architecture Comparison",
    description: "Compare Claude 3 Sonnet vs Llama 3 70B across key metrics.",
    prompt: "Compare Claude 3 Sonnet vs Llama 3 70B. Highlight developer, key strengths, context window size, pricing efficiency, and benchmark performance."
  }
];

export default function PromptLibraryModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.ui.promptLibraryModalOpen);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen) return null;

  const categories = ["All", "Coding & Engineering", "Data Analysis & RAG", "Marketing & Strategy", "Writing & Summarization"];

  const filteredPrompts = PROMPT_TEMPLATES.filter((p) => {
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleUsePrompt = (promptText, id) => {
    // Dispatch custom window event to fill input composer
    window.dispatchEvent(new CustomEvent("insert-prompt", { detail: promptText }));
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
      dispatch(setPromptLibraryModalOpen(false));
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#16191B] border border-[#E7E7E7] dark:border-[#23272A] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E7E7E7] dark:border-[#23272A] flex items-center justify-between bg-[#FAFAFA] dark:bg-[#1A1E20]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E7F3F1] dark:bg-[#183331] text-[#245955] dark:text-[#347d78] flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#171717] dark:text-[#eceff1] font-montserrat">Prompt Library</h2>
              <p className="text-xs text-[#737373] dark:text-[#94A3B8]">Browse and insert prebuilt prompt templates into your composer</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(setPromptLibraryModalOpen(false))}
            className="p-2 rounded-xl text-[#737373] dark:text-[#94A3B8] hover:bg-[#E7E7E7] dark:hover:bg-[#23272A] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-[#E7E7E7] dark:border-[#23272A] space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A3A3A3] dark:text-[#64748B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search prompt templates..."
              className="w-full pl-10 pr-4 py-2 bg-[#F5F7F7] dark:bg-[#0f1214] border border-[#E7E7E7] dark:border-[#23272A] rounded-xl text-xs text-[#171717] dark:text-[#eceff1] placeholder-[#A3A3A3] focus:outline-none focus:border-[#245955] dark:focus:border-[#347d78] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#245955] text-white dark:bg-[#347d78]"
                    : "bg-[#F5F7F7] dark:bg-[#0f1214] text-[#737373] dark:text-[#94A3B8] hover:bg-[#E7E7E7] dark:hover:bg-[#23272A]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredPrompts.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#737373] dark:text-[#94A3B8]">
              No prompt templates found matching your search.
            </div>
          ) : (
            filteredPrompts.map((template) => {
              const IconComp = template.icon;
              const isCopied = copiedId === template.id;
              return (
                <div
                  key={template.id}
                  onClick={() => handleUsePrompt(template.prompt, template.id)}
                  className="p-4 bg-[#F9FBFB] dark:bg-[#1A1E20] hover:bg-white dark:hover:bg-[#23272A] border border-[#E7E7E7] dark:border-[#23272A] hover:border-[#245955] dark:hover:border-[#347d78] rounded-xl transition-all cursor-pointer group flex items-start justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <IconComp size={16} className="text-[#245955] dark:text-[#347d78]" />
                      <h3 className="text-xs font-bold text-[#171717] dark:text-[#eceff1] group-hover:text-[#245955] dark:group-hover:text-[#347d78] transition-colors font-montserrat">
                        {template.title}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E7F3F1] dark:bg-[#183331] text-[#245955] dark:text-[#347d78] font-medium">
                        {template.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#737373] dark:text-[#94A3B8]">{template.description}</p>
                    <div className="mt-2 p-2 rounded-lg bg-white dark:bg-[#0f1214] border border-[#E7E7E7] dark:border-[#23272A] text-[11px] text-[#525252] dark:text-[#CBD5E1] font-mono line-clamp-2">
                      {template.prompt}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUsePrompt(template.prompt, template.id);
                    }}
                    className={`shrink-0 h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isCopied
                        ? "bg-emerald-500 text-white"
                        : "bg-[#245955] text-white dark:bg-[#347d78] hover:opacity-90"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check size={14} />
                        <span>Inserted!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>Use Prompt</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
