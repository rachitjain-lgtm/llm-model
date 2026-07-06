import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Trash2, 
  Edit2, 
  Settings, 
  Building,
  Check, 
  X,
  ArrowRight,
  LogOut,
  PanelLeftOpen
} from "lucide-react";
import { 
  syncActiveConversation, 
  setSearchQuery,
  createChatAsync,
  deleteChatAsync,
  renameChatAsync,
  renameChat
} from "../store/chatSlice";
import { toggleSidebar, setSidebarOpen, setSettingsModalOpen } from "../store/uiSlice";
import { logout } from "../store/authSlice";

export default function Sidebar() {
  const dispatch = useDispatch();
  const conversations = useSelector(state => state.chat.conversations);
  const activeId = useSelector(state => state.chat.activeConversationId);
  const searchQuery = useSelector(state => state.chat.searchQuery);
  const sidebarOpen = useSelector(state => state.ui.sidebarOpen);
  const user = useSelector(state => state.auth.user);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const handleCreateChat = (e) => {
    if (e) e.stopPropagation();
    dispatch(createChatAsync({ title: "New Conversation" }));
  };

  const handleSelectChat = (e, id) => {
    if (e) e.stopPropagation();
    dispatch(syncActiveConversation(id));
  };

  const handleDeleteChat = (e, id) => {
    e.stopPropagation();
    dispatch(deleteChatAsync(id));
  };

  const startRename = (e, id, title) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(title);
  };

  const saveRename = (e, id) => {
    e.stopPropagation();
    const newTitle = editTitle.trim();
    if (newTitle) {
      dispatch(renameChat({ id, title: newTitle }));
      dispatch(renameChatAsync({ id, title: newTitle }));
    }
    setEditingId(null);
  };

  const cancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleContainerClick = () => {
    if (!sidebarOpen) {
      dispatch(setSidebarOpen(true));
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      onClick={handleContainerClick}
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[#171717] border-r border-[#262626] text-white transition-all duration-300 select-none
        ${sidebarOpen 
          ? "w-[280px] translate-x-0 md:relative" 
          : "-translate-x-full md:w-16 md:translate-x-0 md:relative cursor-pointer hover:border-[#245955]"}`}
      title={!sidebarOpen ? "Click left panel to open" : undefined}
    >
      
      {sidebarOpen ? (
        /* Expanded Sidebar Layout */
        <>
          {/* Header */}
          <div className="p-5 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#245955] flex items-center justify-center font-bold text-lg select-none">
                A
              </div>
              <div>
                <h1 className="font-bold text-[15px] leading-tight font-montserrat">AI Studio</h1>
                <p className="text-[11px] text-[#737373]">Cloud LLM Assistant</p>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                dispatch(toggleSidebar());
              }} 
              className="p-1.5 rounded-lg hover:bg-[#262626] text-[#737373] hover:text-white cursor-pointer"
              title="Close Left Panel"
            >
              <X size={18} />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="px-5 py-2">
            <button 
              onClick={handleCreateChat}
              className="w-full h-11 bg-[#245955] hover:bg-[#1d4643] text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus size={16} />
              New chat
            </button>
          </div>

          {/* Search Conversations */}
          <div className="px-5 py-2">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
              <input 
                type="text"
                placeholder="Search conversations"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="w-full h-10 bg-[#262626] border border-[#2c2c2c] rounded-lg pl-10 pr-4 text-xs placeholder-[#737373] text-white focus:outline-none focus:border-[#245955] transition-colors"
              />
            </div>
          </div>

          {/* Recent Conversations list */}
          <div className="flex-1 overflow-y-auto dark-scroll px-3 py-2 space-y-1 select-none">
            <div className="px-2 py-1 text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
              Recent conversations
            </div>
            
            {filteredConversations.length === 0 ? (
              <div className="px-3 py-4 text-xs text-[#737373] text-center">
                No conversations found
              </div>
            ) : (
              filteredConversations.map((chat) => {
                const isActive = chat.id === activeId;
                const isEditing = chat.id === editingId;

                return (
                  <div 
                    key={chat.id}
                    onClick={(e) => handleSelectChat(e, chat.id)}
                    className={`group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 border-l-2
                      ${isActive 
                        ? "bg-[#245955]/15 border-[#245955] text-white" 
                        : "border-transparent text-[#A3A3A3] hover:bg-[#262626] hover:text-white"}`}
                  >
                    <MessageSquare size={16} className="flex-shrink-0 text-[#737373]" />
                    
                    <div className="flex-1 min-w-0 pr-12">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <input 
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveRename(e, chat.id);
                              if (e.key === "Escape") cancelRename(e);
                            }}
                            className="w-full bg-[#171717] border border-[#245955] text-xs px-1.5 py-0.5 rounded text-white focus:outline-none"
                            autoFocus
                          />
                          <button onClick={(e) => saveRename(e, chat.id)} className="text-emerald-500 hover:text-emerald-400">
                            <Check size={12} />
                          </button>
                          <button onClick={cancelRename} className="text-rose-500 hover:text-rose-400">
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="text-xs font-semibold truncate leading-normal">
                            {chat.title}
                          </div>
                          <div className="text-[10px] text-[#737373] mt-0.5">
                            {chat.timestamp}
                          </div>
                        </>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <button 
                          onClick={(e) => startRename(e, chat.id, chat.title)}
                          className="p-1 rounded hover:bg-[#333] text-[#737373] hover:text-white"
                          title="Rename"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteChat(e, chat.id)}
                          className="p-1 rounded hover:bg-rose-950/30 text-[#737373] hover:text-rose-400"
                          title="Delete conversation"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            <div className="px-3 py-2 text-xs font-medium text-[#737373] hover:text-white flex items-center gap-1 cursor-pointer transition-colors pt-3">
              <ArrowRight size={14} className="rotate-0 transition-transform group-hover:translate-x-0.5" />
              <span>View all conversations</span>
            </div>
          </div>

          {/* Bottom section */}
          <div className="p-4 border-t border-[#262626] bg-[#121212] space-y-1">
            {user && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1a1a1a]/40 border border-[#262626] mb-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-lg object-cover border border-[#262626]" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#245955] flex items-center justify-center font-bold text-xs text-white uppercase select-none">
                      {user.name.substring(0, 2)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate text-white">{user.name}</div>
                    <div className="text-[10px] text-[#737373] truncate">{user.email}</div>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(logout());
                  }}
                  title="Sign Out"
                  className="p-1.5 rounded-md hover:bg-[#262626] text-[#737373] hover:text-red-400 transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#262626] cursor-pointer transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#262626] flex items-center justify-center text-[#737373]">
                  <Building size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">Enterprise Workspace</div>
                  <div className="text-[10px] text-[#737373] truncate">SSO • us-east-1 • 12 members</div>
                </div>
              </div>
              <ArrowRight size={12} className="text-[#737373] rotate-270" />
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                dispatch(setSettingsModalOpen(true));
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-[#262626] cursor-pointer text-left text-xs font-medium text-[#A3A3A3] hover:text-white transition-colors"
            >
              <Settings size={16} />
              Settings
            </button>
          </div>
        </>
      ) : (
        /* Collapsed Mini Sidebar Layout (Click anywhere to re-open) */
        <div className="flex flex-col items-center justify-between h-full py-4 px-2">
          
          {/* Top section: Logo + Open action icon */}
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={() => dispatch(setSidebarOpen(true))}
              className="w-10 h-10 rounded-xl bg-[#245955] hover:bg-[#1d4643] flex items-center justify-center font-bold text-base text-white shadow-sm transition-transform hover:scale-105 cursor-pointer group relative"
              title="Open Left Panel"
            >
              <span className="group-hover:hidden">A</span>
              <PanelLeftOpen size={18} className="hidden group-hover:block" />
            </button>

            {/* New chat mini button */}
            <button 
              onClick={handleCreateChat}
              className="w-9 h-9 rounded-lg bg-[#262626] hover:bg-[#245955] text-[#A3A3A3] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="New Chat"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Middle section: Collapsed Chat Icons list */}
          <div className="flex-1 overflow-y-auto dark-scroll my-4 py-2 space-y-2 flex flex-col items-center">
            {filteredConversations.slice(0, 5).map((chat) => {
              const isActive = chat.id === activeId;
              return (
                <button
                  key={chat.id}
                  onClick={(e) => handleSelectChat(e, chat.id)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer relative group ${
                    isActive 
                      ? "bg-[#245955] text-white shadow-xs" 
                      : "bg-[#262626] text-[#737373] hover:text-white hover:bg-[#333]"
                  }`}
                  title={chat.title}
                >
                  <MessageSquare size={16} />
                </button>
              );
            })}
          </div>

          {/* Bottom section: Settings & User Avatar */}
          <div className="flex flex-col items-center gap-3 pt-2 border-t border-[#262626] w-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch(setSettingsModalOpen(true));
              }}
              className="w-9 h-9 rounded-lg bg-[#262626] hover:bg-[#333] text-[#737373] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings size={16} />
            </button>

            {user && (
              <div className="w-8 h-8 rounded-lg bg-[#245955] flex items-center justify-center font-bold text-xs text-white uppercase select-none">
                {user.name.substring(0, 2)}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
