import { useRef, useEffect, useState } from "react";
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
  toggleRegionDropdown, 
  setRegionDropdownOpen,
  toggleTheme
} from "../store/uiSlice";
import { 
  updateChatSettings, 
  renameChat
} from "../store/chatSlice";
import { MODEL_OPTIONS, getModelLabel } from "../config/models";

export default function Topbar() {
  const dispatch = useDispatch();
  const activeId = useSelector(state => state.chat.activeConversationId);
  const conversations = useSelector(state => state.chat.conversations);
  const activeChat = conversations.find(c => c.id === activeId);
  const sidebarOpen = useSelector(state => state.ui.sidebarOpen);
  
  const modelDropdownOpen = useSelector(state => state.ui.modelDropdownOpen);
  const regionDropdownOpen = useSelector(state => state.ui.regionDropdownOpen);
  const theme = useSelector(state => state.ui.theme);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");

  const modelRef = useRef(null);
  const regionRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modelRef.current && !modelRef.current.contains(event.target)) {
        dispatch(setModelDropdownOpen(false));
      }
      if (regionRef.current && !regionRef.current.contains(event.target)) {
        dispatch(setRegionDropdownOpen(false));
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dispatch]);

  if (!activeChat) {
    return (
      <div className="h-16 border-b border-[#E7E7E7] dark:border-[#23272A] bg-white dark:bg-[#16191B] flex items-center px-6 transition-colors duration-200">
        <button 
          onClick={() => dispatch(toggleSidebar())} 
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#23272A] mr-2 text-[#737373] dark:text-[#94A3B8] cursor-pointer"
          title={sidebarOpen ? "Hide left panel" : "Open left panel"}
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

  const regions = [
    "global",
    "auto"
  ];

  const [copiedToast, setCopiedToast] = useState(false);

  const handleShare = () => {
    if (!activeChat) return;
    const exportText = `AI Studio Conversation: ${activeChat.title}\nModel: ${getModelLabel(activeChat.model)}\n\n` + 
      (activeChat.messages || []).map(m => `[${m.sender.toUpperCase()}]: ${m.text}`).join("\n\n");

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(exportText);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  return (
    <div className="h-16 border-b border-[#E7E7E7] dark:border-[#23272A] bg-white dark:bg-[#16191B] flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-30 select-none transition-colors duration-200">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button 
          onClick={() => dispatch(toggleSidebar())} 
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] cursor-pointer transition-colors"
          title={sidebarOpen ? "Hide left panel" : "Open left panel"}
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
                onClick={() => {
                  setTitleInput(activeChat.title);
                  setIsEditingTitle(true);
                }}
                className="p-1 rounded text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:text-[#ECEFF1] hover:bg-slate-100 dark:hover:bg-[#23272A] transition-colors"
                title="Edit Title"
              >
                <Edit3 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Right: Model + Region + Theme Toggle + Share */}
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        
        {/* Model Dropdown */}
        <div className="relative hidden sm:block" ref={modelRef}>
          <button 
            onClick={() => dispatch(toggleModelDropdown())}
            className="h-10 px-3.5 border border-[#E7E7E7] dark:border-[#23272A] hover:border-[#cbd5e1] dark:hover:border-zinc-700 rounded-lg bg-white dark:bg-[#16191B] flex items-center gap-2 text-xs font-semibold text-[#171717] dark:text-[#ECEFF1] shadow-sm transition-colors cursor-pointer"
          >
            <span>{getModelLabel(activeChat.model)}</span>
            <ChevronDown size={14} className={`text-[#737373] dark:text-[#94A3B8] transition-transform duration-200 ${modelDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {modelDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-[#1E2326] border border-[#E7E7E7] dark:border-[#23272A] rounded-lg shadow-lg py-1.5 z-50 transition-colors">
              {MODEL_OPTIONS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    dispatch(updateChatSettings({ id: activeChat.id, key: "model", value: model.id }));
                    dispatch(setModelDropdownOpen(false));
                  }}
                  className="w-full px-4 py-2.5 text-xs text-left hover:bg-[#FAFAFA] dark:hover:bg-[#23272A] flex items-center justify-between cursor-pointer"
                >
                  <span className={activeChat.model === model.id ? "font-semibold text-[#245955] dark:text-[#347d78]" : "text-[#737373] dark:text-[#94A3B8]"}>
                    {model.label}
                  </span>
                  {activeChat.model === model.id && <Check size={14} className="text-[#245955] dark:text-[#347d78]" />}
                </button>
              ))}
              <div className="border-t border-[#E7E7E7] dark:border-[#23272A] mt-1.5 pt-1.5 px-4 pb-0.5">
                <div className="text-[10px] text-[#737373] dark:text-[#94A3B8] leading-normal">
                  Preset model IDs for free-tier testing.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Region Dropdown */}
        <div className="relative hidden sm:block" ref={regionRef}>
          <button 
            onClick={() => dispatch(toggleRegionDropdown())}
            className="h-10 px-3.5 border border-[#E7E7E7] dark:border-[#23272A] hover:border-[#cbd5e1] dark:hover:border-zinc-700 rounded-lg bg-white dark:bg-[#16191B] flex items-center gap-2 text-xs font-semibold text-[#171717] dark:text-[#ECEFF1] shadow-sm transition-colors cursor-pointer"
          >
            <span>{activeChat.region}</span>
            <ChevronDown size={14} className={`text-[#737373] dark:text-[#94A3B8] transition-transform duration-200 ${regionDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {regionDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-[#1E2326] border border-[#E7E7E7] dark:border-[#23272A] rounded-lg shadow-lg py-1.5 z-50 transition-colors">
              {regions.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    dispatch(updateChatSettings({ id: activeChat.id, key: "region", value: r }));
                    dispatch(setRegionDropdownOpen(false));
                  }}
                  className="w-full px-4 py-2 text-xs text-left hover:bg-[#FAFAFA] dark:hover:bg-[#23272A] flex items-center justify-between cursor-pointer"
                >
                  <span className={activeChat.region === r ? "font-semibold text-[#245955] dark:text-[#347d78]" : "text-[#737373] dark:text-[#94A3B8]"}>
                    {r}
                  </span>
                  {activeChat.region === r && <Check size={14} className="text-[#245955] dark:text-[#347d78]" />}
                </button>
              ))}
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
          onClick={handleShare}
          className="relative p-2.5 border border-[#E7E7E7] dark:border-[#23272A] bg-white dark:bg-[#16191B] hover:bg-slate-50 dark:hover:bg-[#23272A] text-[#737373] dark:text-[#94A3B8] hover:text-[#171717] dark:hover:text-[#ECEFF1] rounded-lg shadow-sm cursor-pointer transition-colors"
          title="Share / Copy Conversation"
        >
          {copiedToast ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
          {copiedToast && (
            <span className="absolute right-0 top-12 px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-semibold rounded shadow-lg whitespace-nowrap z-50">
              Copied to clipboard!
            </span>
          )}
        </button>

      </div>
    </div>
  );
}
