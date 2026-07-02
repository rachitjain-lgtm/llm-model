import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { chatApi } from "../api/chatApi";

// Async thunk to fetch chats from MongoDB
export const fetchChats = createAsyncThunk("chat/fetchChats", async (_, { rejectWithValue }) => {
  try {
    const chats = await chatApi.fetchUserChats();
    return chats;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Async thunk to create a new chat in MongoDB
export const createChatAsync = createAsyncThunk("chat/createChatAsync", async (chatData, { rejectWithValue }) => {
  try {
    const newChat = await chatApi.createChat(chatData || {});
    return newChat;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Async thunk to delete a chat from MongoDB
export const deleteChatAsync = createAsyncThunk("chat/deleteChatAsync", async (chatId, { rejectWithValue }) => {
  try {
    await chatApi.deleteChat(chatId);
    return chatId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Async thunk to rename a chat in MongoDB
export const renameChatAsync = createAsyncThunk("chat/renameChatAsync", async ({ id, title }, { rejectWithValue }) => {
  try {
    await chatApi.renameChat(id, title);
    return { id, title };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Async thunk to add user message in MongoDB
export const addMessageAsync = createAsyncThunk("chat/addMessageAsync", async ({ chatId, sender, content }, { rejectWithValue }) => {
  try {
    const message = await chatApi.saveMessage(chatId, { sender, content });
    return { chatId, message };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const initialState = {
  conversations: [],
  activeConversationId: null,
  searchQuery: "",
  streamingOn: true,
  isLoading: false,
  error: null,
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
    },
    setActiveConversation(state, action) {
      state.activeConversationId = action.payload;
    },
    createNewChat(state) {
      const id = `chat-${Date.now()}`;
      const newChat = {
        id,
        title: "New Conversation",
        timestamp: "Today, " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: "Claude 3 Sonnet",
        provider: "Cloud AI",
        region: "us-east-1",
        temperature: 0.7,
        maxTokens: 4096,
        useKnowledgeBase: false,
        useGuardrails: true,
        messages: []
      };
      state.conversations.unshift(newChat);
      state.activeConversationId = id;
    },
    deleteChat(state, action) {
      state.conversations = state.conversations.filter(c => c.id !== action.payload);
      if (state.activeConversationId === action.payload) {
        state.activeConversationId = state.conversations[0]?.id || null;
      }
    },
    renameChat(state, action) {
      const { id, title } = action.payload;
      const chat = state.conversations.find(c => c.id === id);
      if (chat) {
        chat.title = title;
      }
    },
    updateChatSettings(state, action) {
      const { id, key, value } = action.payload;
      const chat = state.conversations.find(c => c.id === id);
      if (chat) {
        chat[key] = value;
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
      const chat = state.conversations.find(c => c.id === chatId);
      if (chat) {
        chat.messages.push(message);
      }
    },
    updateLastMessageText(state, action) {
      const { chatId, text } = action.payload;
      const chat = state.conversations.find(c => c.id === chatId);
      if (chat && chat.messages.length > 0) {
        const lastMsg = chat.messages[chat.messages.length - 1];
        if (lastMsg.sender === "assistant") {
          lastMsg.text = text;
        }
      }
    },
    addSourceToLastMessage(state, action) {
      const { chatId, source } = action.payload;
      const chat = state.conversations.find(c => c.id === chatId);
      if (chat && chat.messages.length > 0) {
        const lastMsg = chat.messages[chat.messages.length - 1];
        if (lastMsg.sender === "assistant") {
          if (!lastMsg.sources) lastMsg.sources = [];
          lastMsg.sources.push(source);
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch chats
      .addCase(fetchChats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
        if (action.payload.length > 0) {
          state.activeConversationId = action.payload[0].id;
        }
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create chat async
      .addCase(createChatAsync.fulfilled, (state, action) => {
        state.conversations.unshift(action.payload);
        state.activeConversationId = action.payload.id;
      })
      // Delete chat async
      .addCase(deleteChatAsync.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(c => c.id !== action.payload);
        if (state.activeConversationId === action.payload) {
          state.activeConversationId = state.conversations[0]?.id || null;
        }
      })
      // Rename chat async
      .addCase(renameChatAsync.fulfilled, (state, action) => {
        const { id, title } = action.payload;
        const chat = state.conversations.find(c => c.id === id);
        if (chat) chat.title = title;
      })
      // Add message async
      .addCase(addMessageAsync.fulfilled, (state, action) => {
        const { chatId, message } = action.payload;
        const chat = state.conversations.find(c => c.id === chatId);
        if (chat) {
          const exists = chat.messages.some(m => m.id === message.id);
          if (!exists) chat.messages.push(message);
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
  addSourceToLastMessage
} = chatSlice.actions;

export default chatSlice.reducer;
