import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Menu, 
  ChevronDown, 
  Share2, 
  Check, 
  Edit3,
  Sun,
  Moon
} from "lucide-react";
import { 
  toggleSidebar, 
  toggleModelDropdown, 
  setModelDropdownOpen, 
  toggleTheme
} from "../store/uiSlice";
import { 
  updateChatSettings, 
  renameChat
} from "../store/chatSlice";

export default function Topbar() {
  const dispatch = useDispatch();
  const activeId = useSelector(state => state.chat.activeConversationId);
  const conversations = useSelector(state => state.chat.conversations);
  const activeChat = conversations.find(c => c.id === activeId);
  
  const modelDropdownOpen = useSelector(state => state.ui.modelDropdownOpen);
  const theme = useSelector(state => state.ui.theme);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");

  const modelRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modelRef.current && !modelRef.current.contains(event.target)) {
        dispatch(setModelDropdownOpen(false));
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dispatch]);

  useEffect(() => {
    if (activeChat) {
      setTitleInput(activeChat.title);
    }
  }, [activeChat]);

  if (!activeChat) {
    return (
      <div className="h-16 border-b border-[#E7E7E7] dark:border-[#23272A] bg-white dark:bg-[#16191B] flex items-center px-6 transition-colors duration-200">
        <button 
          onClick={() => dispatch(toggleSidebar())} 
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#23272A] mr-2 text-[#737373] dark:text-[#94A3B8] md:hidden cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <span className="text-sm font-semibold text-[#737373] dark:text-[#94A3B8]">No Active Conversation</span>
      </div>
    );
  }

  const handleRenameSubmit = () => {
    if (titleInput.trim() && titleInput !== activeChat.title) {
      dispatch(renameChat({ id: activeChat.id, title: titleInput.trim() }));
    }
    setIsEditingTitle(false);
  };

  const models = [
    "Claude 3 Sonnet",
    "Claude 3 Haiku",
    "Llama 3 70B",
    "Titan Text G1 - Premier"
  ];

  return (
    <div className="h-16 border-b border-[#E7E7E7] dark:border-[#23272A] bg-white dark:bg-[#16191B] flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-30 select-none transition-colors duration-200">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button 
          onClick={() => dispatch(toggleSidebar())} 
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] cursor-pointer transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex items-center gap-2 min-w-0">
          {isEditingTitle ? (
            <input 
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit();
                if (e.key === "Escape") setIsEditingTitle(false);
              }}
              className="text-base font-semibold border-b border-[#245955] dark:border-[#347d78] text-[#171717] dark:text-[#ECEFF1] bg-transparent focus:outline-none px-0.5"
              autoFocus
            />
          ) : (
            <>
              <h2 className="text-base font-semibold text-[#171717] dark:text-[#ECEFF1] truncate font-montserrat transition-colors">
                {activeChat.title}
              </h2>
              <button 
                onClick={() => setIsEditingTitle(true)}
                className="p-1 rounded text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:text-[#ECEFF1] hover:bg-slate-100 dark:hover:bg-[#23272A] transition-colors"
                title="Edit Title"
              >
                <Edit3 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Right: Model + Theme Toggle + Share + Toggle Controls */}
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        
        {/* Model Dropdown */}
        <div className="relative hidden sm:block" ref={modelRef}>
          <button 
            onClick={() => dispatch(toggleModelDropdown())}
            className="h-10 px-3.5 border border-[#E7E7E7] dark:border-[#23272A] hover:border-[#cbd5e1] dark:hover:border-zinc-700 rounded-lg bg-white dark:bg-[#16191B] flex items-center gap-2 text-xs font-semibold text-[#171717] dark:text-[#ECEFF1] shadow-sm transition-colors cursor-pointer"
          >
            <span>{activeChat.model}</span>
            <ChevronDown size={14} className={`text-[#737373] dark:text-[#94A3B8] transition-transform duration-200 ${modelDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {modelDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-[#1E2326] border border-[#E7E7E7] dark:border-[#23272A] rounded-lg shadow-lg py-1.5 z-50 transition-colors">
              {models.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    dispatch(updateChatSettings({ id: activeChat.id, key: "model", value: m }));
                    dispatch(setModelDropdownOpen(false));
                  }}
                  className="w-full px-4 py-2.5 text-xs text-left hover:bg-[#FAFAFA] dark:hover:bg-[#23272A] flex items-center justify-between cursor-pointer"
                >
                  <span className={activeChat.model === m ? "font-semibold text-[#245955] dark:text-[#347d78]" : "text-[#737373] dark:text-[#94A3B8]"}>
                    {m}
                  </span>
                  {activeChat.model === m && <Check size={14} className="text-[#245955] dark:text-[#347d78]" />}
                </button>
              ))}
              <div className="border-t border-[#E7E7E7] dark:border-[#23272A] mt-1.5 pt-1.5 px-4 pb-0.5">
                <button className="text-[11px] font-semibold text-[#245955] dark:text-[#347d78] hover:text-[#1d4643] dark:hover:text-[#2b6763] cursor-pointer">
                  View all models
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme toggler */}
        <button 
          onClick={() => dispatch(toggleTheme())}
          className="p-2.5 border border-[#E7E7E7] dark:border-[#23272A] bg-white dark:bg-[#16191B] hover:bg-slate-50 dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:text-[#ECEFF1] rounded-lg shadow-sm cursor-pointer transition-colors"
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Share/Export button */}
        <button 
          className="p-2.5 border border-[#E7E7E7] dark:border-[#23272A] bg-white dark:bg-[#16191B] hover:bg-slate-50 dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:text-[#ECEFF1] rounded-lg shadow-sm cursor-pointer transition-colors"
          title="Share / Export"
        >
          <Share2 size={16} />
        </button>

      </div>
    </div>
  );
}
