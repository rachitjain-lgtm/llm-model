import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { chatApi } from "../api/chatApi";
import { DEFAULT_MODEL_ID } from "../config/models";

export const fetchChats = createAsyncThunk("chat/fetchChats", async (_, { rejectWithValue }) => {
  try {
    const chats = await chatApi.fetchUserChats();
    return chats;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const createChatAsync = createAsyncThunk("chat/createChatAsync", async (chatData, { rejectWithValue }) => {
  try {
    const newChat = await chatApi.createChat(chatData || {});
    return newChat;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deleteChatAsync = createAsyncThunk("chat/deleteChatAsync", async (chatId, { rejectWithValue }) => {
  try {
    await chatApi.deleteChat(chatId);
    return chatId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const renameChatAsync = createAsyncThunk("chat/renameChatAsync", async ({ id, title }, { rejectWithValue }) => {
  try {
    await chatApi.renameChat(id, title);
    return { id, title };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const addMessageAsync = createAsyncThunk("chat/addMessageAsync", async ({ chatId, sender, content }, { rejectWithValue }) => {
  try {
    const message = await chatApi.saveMessage(chatId, { sender, content });
    return { chatId, message };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const getStoredConversations = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const saved = localStorage.getItem("chat_conversations");

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
};

const persistState = (state) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("chat_conversations", JSON.stringify(state.conversations));
  localStorage.setItem("chat_active_conversation_id", state.activeConversationId || "");
};

const storedConversations = getStoredConversations();
const storedActiveConversationId = typeof window !== "undefined"
  ? localStorage.getItem("chat_active_conversation_id")
  : null;

const getUserConversations = (email) => {
  if (typeof window === "undefined" || !email) return [];
  const key = `conversations_${email.toLowerCase()}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing user conversations:", e);
    }
  }
  // Sample mock conversations shown ONLY for demo@gmail.com
  if (email.toLowerCase() === "demo@gmail.com") {
    localStorage.setItem(key, JSON.stringify(mockConversations));
    return mockConversations;
  }
  // For all actual logged-in users, start with empty list []
  localStorage.setItem(key, JSON.stringify([]));
  return [];
};

const saveUserConversations = (email, conversations) => {
  if (typeof window !== "undefined" && email) {
    const key = `conversations_${email.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(conversations));
  }
};

const getInitialUserEmail = () => {
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        return parsed?.email || null;
      } catch (e) {}
    }
  }
  return null;
};

const initialEmail = getInitialUserEmail();
const initialConversations = getUserConversations(initialEmail);

const initialState = {
<<<<<<< HEAD
  conversations: initialConversations,
  activeConversationId: initialConversations.length > 0 ? initialConversations[0].id : null,
  searchQuery: "",
  isLoading: false,
  currentUserEmail: initialEmail
=======
  conversations: storedConversations || [],
  activeConversationId: storedActiveConversationId || null,
  searchQuery: "",
  streamingOn: true,
  isLoading: false,
  error: null
>>>>>>> 23c19ea2dc1f4a0130a5ce91cc3250ed8930c0a8
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
<<<<<<< HEAD
    loadUserConversations(state, action) {
      const email = action.payload;
      state.currentUserEmail = email;
      const userConvs = getUserConversations(email);
      state.conversations = userConvs;
      state.activeConversationId = userConvs.length > 0 ? userConvs[0].id : null;
=======
    setConversations(state, action) {
      state.conversations = action.payload;
      if (action.payload.length > 0 && !state.activeConversationId) {
        state.activeConversationId = action.payload[0].id;
      }
      persistState(state);
>>>>>>> 23c19ea2dc1f4a0130a5ce91cc3250ed8930c0a8
    },
    setActiveConversation(state, action) {
      state.activeConversationId = action.payload;
      persistState(state);
    },
    createNewChat(state) {
      const id = `chat-${Date.now()}`;
      const newChat = {
        id,
<<<<<<< HEAD
        title: "New Conversation",
        timestamp: "Today, " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: "Claude 3 Sonnet",
        provider: "Cloud AI",
=======
        title: "New chat",
        timestamp: "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        model: DEFAULT_MODEL_ID,
        provider: "OpenRouter",
        region: "global",
>>>>>>> 23c19ea2dc1f4a0130a5ce91cc3250ed8930c0a8
        temperature: 0.7,
        maxTokens: 4096,
        useKnowledgeBase: false,
        useGuardrails: true,
        messages: []
      };
      state.conversations.unshift(newChat);
      state.activeConversationId = id;
<<<<<<< HEAD
      saveUserConversations(state.currentUserEmail, state.conversations);
=======
      persistState(state);
>>>>>>> 23c19ea2dc1f4a0130a5ce91cc3250ed8930c0a8
    },
    deleteChat(state, action) {
      state.conversations = state.conversations.filter((conversation) => conversation.id !== action.payload);
      if (state.activeConversationId === action.payload) {
        state.activeConversationId = state.conversations[0]?.id || null;
      }
<<<<<<< HEAD
      saveUserConversations(state.currentUserEmail, state.conversations);
=======
      persistState(state);
>>>>>>> 23c19ea2dc1f4a0130a5ce91cc3250ed8930c0a8
    },
    renameChat(state, action) {
      const { id, title } = action.payload;
      const chat = state.conversations.find((conversation) => conversation.id === id);
      if (chat) {
        chat.title = title;
<<<<<<< HEAD
        saveUserConversations(state.currentUserEmail, state.conversations);
=======
        persistState(state);
>>>>>>> 23c19ea2dc1f4a0130a5ce91cc3250ed8930c0a8
      }
    },
    updateChatSettings(state, action) {
      const { id, key, value } = action.payload;
      const chat = state.conversations.find((conversation) => conversation.id === id);
      if (chat) {
        chat[key] = value;
<<<<<<< HEAD
        saveUserConversations(state.currentUserEmail, state.conversations);
=======
        persistState(state);
>>>>>>> 23c19ea2dc1f4a0130a5ce91cc3250ed8930c0a8
      }
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    addMessage(state, action) {
      const { chatId, message } = action.payload;
      const chat = state.conversations.find((conversation) => conversation.id === chatId);
      if (chat) {
        chat.messages.push(message);
<<<<<<< HEAD
        saveUserConversations(state.currentUserEmail, state.conversations);
=======
        persistState(state);
>>>>>>> 23c19ea2dc1f4a0130a5ce91cc3250ed8930c0a8
      }
    },
    updateLastMessageText(state, action) {
      const { chatId, text } = action.payload;
      const chat = state.conversations.find((conversation) => conversation.id === chatId);
      if (chat && chat.messages.length > 0) {
        const lastMsg = chat.messages[chat.messages.length - 1];
        if (lastMsg.sender === "assistant") {
          lastMsg.text = text;
<<<<<<< HEAD
          saveUserConversations(state.currentUserEmail, state.conversations);
=======
          persistState(state);
>>>>>>> 23c19ea2dc1f4a0130a5ce91cc3250ed8930c0a8
        }
      }
    },
    addSourceToLastMessage(state, action) {
      const { chatId, source } = action.payload;
      const chat = state.conversations.find((conversation) => conversation.id === chatId);
      if (chat && chat.messages.length > 0) {
        const lastMsg = chat.messages[chat.messages.length - 1];
        if (lastMsg.sender === "assistant") {
          if (!lastMsg.sources) lastMsg.sources = [];
          lastMsg.sources.push(source);
<<<<<<< HEAD
          saveUserConversations(state.currentUserEmail, state.conversations);
        }
      }
    },
    clearActiveChat(state) {
      if (!state.activeConversationId) return;
      const chat = state.conversations.find(c => c.id === state.activeConversationId);
      if (chat) {
        chat.messages = [];
        saveUserConversations(state.currentUserEmail, state.conversations);
      }
    },
    editMessage(state, action) {
      const { chatId, messageId, newText } = action.payload;
      const chat = state.conversations.find(c => c.id === (chatId || state.activeConversationId));
      if (chat) {
        const msg = chat.messages.find(m => m.id === messageId);
        if (msg) {
          msg.text = newText;
          saveUserConversations(state.currentUserEmail, state.conversations);
=======
          persistState(state);
>>>>>>> 23c19ea2dc1f4a0130a5ce91cc3250ed8930c0a8
        }
      }
    },
    syncActiveConversation(state, action) {
      state.activeConversationId = action.payload;
      persistState(state);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
        if (action.payload.length > 0) {
          state.activeConversationId = action.payload[0].id;
        }
        persistState(state);
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createChatAsync.fulfilled, (state, action) => {
        state.conversations.unshift(action.payload);
        state.activeConversationId = action.payload.id;
        persistState(state);
      })
      .addCase(deleteChatAsync.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter((conversation) => conversation.id !== action.payload);
        if (state.activeConversationId === action.payload) {
          state.activeConversationId = state.conversations[0]?.id || null;
        }
        persistState(state);
      })
      .addCase(renameChatAsync.fulfilled, (state, action) => {
        const { id, title } = action.payload;
        const chat = state.conversations.find((conversation) => conversation.id === id);
        if (chat) {
          chat.title = title;
          persistState(state);
        }
      })
      .addCase(addMessageAsync.fulfilled, (state, action) => {
        const { chatId, message } = action.payload;
        const chat = state.conversations.find((conversation) => conversation.id === chatId);
        if (chat) {
          const exists = chat.messages.some((existingMessage) => existingMessage.id === message.id);
          if (!exists) {
            chat.messages.push(message);
            persistState(state);
          }
        }
      });
  }
});

export const {
<<<<<<< HEAD
  loadUserConversations,
=======
  setConversations,
>>>>>>> 23c19ea2dc1f4a0130a5ce91cc3250ed8930c0a8
  setActiveConversation,
  createNewChat,
  deleteChat,
  renameChat,
  updateChatSettings,
  setSearchQuery,
  setLoading,
  addMessage,
  updateLastMessageText,
  addSourceToLastMessage,
<<<<<<< HEAD
  clearActiveChat,
  editMessage
=======
  syncActiveConversation
>>>>>>> 23c19ea2dc1f4a0130a5ce91cc3250ed8930c0a8
} = chatSlice.actions;

export default chatSlice.reducer;
