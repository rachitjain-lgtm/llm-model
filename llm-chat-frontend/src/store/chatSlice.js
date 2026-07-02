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

const initialState = {
  conversations: storedConversations || [],
  activeConversationId: storedActiveConversationId || null,
  searchQuery: "",
  streamingOn: true,
  isLoading: false,
  error: null
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setConversations(state, action) {
      state.conversations = action.payload;
      if (action.payload.length > 0 && !state.activeConversationId) {
        state.activeConversationId = action.payload[0].id;
      }
      persistState(state);
    },
    setActiveConversation(state, action) {
      state.activeConversationId = action.payload;
      persistState(state);
    },
    createNewChat(state) {
      const id = `chat-${Date.now()}`;
      const newChat = {
        id,
        title: "New chat",
        timestamp: "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        model: DEFAULT_MODEL_ID,
        provider: "OpenRouter",
        region: "global",
        temperature: 0.7,
        maxTokens: 4096,
        useKnowledgeBase: false,
        useGuardrails: true,
        messages: []
      };
      state.conversations.unshift(newChat);
      state.activeConversationId = id;
      persistState(state);
    },
    deleteChat(state, action) {
      state.conversations = state.conversations.filter((conversation) => conversation.id !== action.payload);
      if (state.activeConversationId === action.payload) {
        state.activeConversationId = state.conversations[0]?.id || null;
      }
      persistState(state);
    },
    renameChat(state, action) {
      const { id, title } = action.payload;
      const chat = state.conversations.find((conversation) => conversation.id === id);
      if (chat) {
        chat.title = title;
        persistState(state);
      }
    },
    updateChatSettings(state, action) {
      const { id, key, value } = action.payload;
      const chat = state.conversations.find((conversation) => conversation.id === id);
      if (chat) {
        chat[key] = value;
        persistState(state);
      }
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
    toggleStreaming(state) {
      state.streamingOn = !state.streamingOn;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    addMessage(state, action) {
      const { chatId, message } = action.payload;
      const chat = state.conversations.find((conversation) => conversation.id === chatId);
      if (chat) {
        chat.messages.push(message);
        persistState(state);
      }
    },
    updateLastMessageText(state, action) {
      const { chatId, text } = action.payload;
      const chat = state.conversations.find((conversation) => conversation.id === chatId);
      if (chat && chat.messages.length > 0) {
        const lastMsg = chat.messages[chat.messages.length - 1];
        if (lastMsg.sender === "assistant") {
          lastMsg.text = text;
          persistState(state);
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
          persistState(state);
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
  setConversations,
  setActiveConversation,
  createNewChat,
  deleteChat,
  renameChat,
  updateChatSettings,
  setSearchQuery,
  toggleStreaming,
  setLoading,
  addMessage,
  updateLastMessageText,
  addSourceToLastMessage,
  syncActiveConversation
} = chatSlice.actions;

export default chatSlice.reducer;
