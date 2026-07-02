import { createSlice } from "@reduxjs/toolkit";

const mockConversations = [
  {
    id: "chat-1",
    title: "AI Assistant overview",
    timestamp: "Today, 10:24 AM",
    model: "Claude 3 Sonnet",
    provider: "Cloud AI",
    region: "us-east-1",
    temperature: 0.7,
    maxTokens: 4096,
    useKnowledgeBase: true,
    useGuardrails: true,
    messages: [
      {
        id: "msg-1-1",
        sender: "user",
        text: "Can you explain how this Cloud AI platform works and its key features?",
        time: "10:24 AM",
        initials: "AR"
      },
      {
        id: "msg-1-2",
        sender: "assistant",
        text: `The Cloud AI platform is a fully managed service that offers a choice of high-performing foundation models (FMs) from leading AI companies through a single API, along with a broad set of capabilities you need to build generative AI applications with security, privacy, and responsible AI.

### Key features

* **Choice of leading foundation models**: Access Claude, Llama, Titan, etc.
* **Serverless experience**: Fully managed, no infrastructure to set up.
* **Data privacy and security**: Your data is encrypted and remains within your VPC.
* **Responsible AI with guardrails**: Implement safety thresholds for content filters.
* **Knowledge Bases for RAG applications**: Build customized AI connected to your private documentation.

Learn more in the platform documentation.`,
        time: "10:25 AM",
        sources: [
          {
            title: "Cloud AI Platform Guide",
            url: "https://example.com/docs/what-is-cloud-ai"
          }
        ]
      }
    ]
  },
  {
    id: "chat-2",
    title: "Compare Claude vs Llama",
    timestamp: "Today, 09:15 AM",
    model: "Claude 3 Sonnet",
    provider: "Cloud AI",
    region: "us-east-1",
    temperature: 0.7,
    maxTokens: 4096,
    useKnowledgeBase: false,
    useGuardrails: true,
    messages: [
      {
        id: "msg-2-1",
        sender: "user",
        text: "Compare Claude 3 Sonnet vs Llama 3 70B",
        time: "09:15 AM",
        initials: "AR"
      },
      {
        id: "msg-2-2",
        sender: "assistant",
        text: `Here is a quick comparison of Claude 3 Sonnet and Llama 3 70B:

1. **Developer**: Claude 3 Sonnet is created by Anthropic, while Llama 3 70B is created by Meta.
2. **Strengths**: Claude is outstanding for complex reasoning, multilingual processing, and writing clean code. Llama 3 70B is highly cost-effective and performs exceptionally for dialogue, summarization, and general instructions.
3. **Context Window**: Claude 3 Sonnet supports up to 200k tokens, providing robust long-document support. Llama 3 70B supports 8k tokens.`,
        time: "09:16 AM"
      }
    ]
  },
  {
    id: "chat-3",
    title: "Summarize product docs",
    timestamp: "Yesterday, 04:32 PM",
    model: "Claude 3 Sonnet",
    provider: "Cloud AI",
    region: "us-east-1",
    temperature: 0.7,
    maxTokens: 4096,
    useKnowledgeBase: true,
    useGuardrails: true,
    messages: [
      {
        id: "msg-3-1",
        sender: "user",
        text: "Can you help me summarize my product docs?",
        time: "04:32 PM",
        initials: "AR"
      },
      {
        id: "msg-3-2",
        sender: "assistant",
        text: "Sure! Please paste the product documentation here, or verify that your Product Docs Knowledge Base is turned on in the bottom composer or the run controls panel so I can reference it.",
        time: "04:33 PM"
      }
    ]
  },
  {
    id: "chat-4",
    title: "Create SQL query",
    timestamp: "Yesterday, 10:03 AM",
    model: "Claude 3 Sonnet",
    provider: "Cloud AI",
    region: "us-east-1",
    temperature: 0.5,
    maxTokens: 2048,
    useKnowledgeBase: false,
    useGuardrails: false,
    messages: [
      {
        id: "msg-4-1",
        sender: "user",
        text: "Write a SQL query to find users who signed up in the last 30 days and ordered more than $100.",
        time: "10:03 AM",
        initials: "AR"
      },
      {
        id: "msg-4-2",
        sender: "assistant",
        text: `Here is the SQL query to retrieve that user list:

\`\`\`sql
SELECT u.id, u.name, u.email, SUM(o.amount) as total_spent
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.signup_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY u.id
HAVING total_spent > 100;
\`\`\``,
        time: "10:03 AM"
      }
    ]
  },
  {
    id: "chat-5",
    title: "Marketing campaign ideas",
    timestamp: "Jun 29, 02:11 PM",
    model: "Llama 3 70B",
    provider: "Cloud AI",
    region: "us-east-1",
    temperature: 0.8,
    maxTokens: 4096,
    useKnowledgeBase: false,
    useGuardrails: true,
    messages: [
      {
        id: "msg-5-1",
        sender: "user",
        text: "List 5 creative ideas for B2B SaaS launch campaign.",
        time: "02:11 PM",
        initials: "AR"
      },
      {
        id: "msg-5-2",
        sender: "assistant",
        text: `Here are 5 creative campaign ideas for your B2B SaaS launch:

1. **The Interactive Audit Tool**: A quick 2-minute calculator showing prospects exactly where they are losing revenue, leading directly to your signup flow.
2. **Private Beta Behind-the-Scenes Vlogs**: A weekly series featuring founders discussing scaling challenges, humanizing the product and generating organic traction.
3. **The "Anti-Complexity" Web Series**: Short, funny videos highlighting the manual processes your tool eliminates.
4. **Industry Leader Roundtable**: Invite top minds for a virtual panel on current issues, showcasing your SaaS as a thought leader in the space.
5. **Co-branded Infographics**: Partner with a non-competing tool to co-publish an insightful industry dataset, widening your reach.`,
        time: "02:12 PM"
      }
    ]
  }
];

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
  conversations: initialConversations,
  activeConversationId: initialConversations.length > 0 ? initialConversations[0].id : null,
  searchQuery: "",
  isLoading: false,
  currentUserEmail: initialEmail
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    loadUserConversations(state, action) {
      const email = action.payload;
      state.currentUserEmail = email;
      const userConvs = getUserConversations(email);
      state.conversations = userConvs;
      state.activeConversationId = userConvs.length > 0 ? userConvs[0].id : null;
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
        temperature: 0.7,
        maxTokens: 4096,
        useKnowledgeBase: false,
        useGuardrails: true,
        messages: []
      };
      state.conversations.unshift(newChat);
      state.activeConversationId = id;
      saveUserConversations(state.currentUserEmail, state.conversations);
    },
    deleteChat(state, action) {
      state.conversations = state.conversations.filter(c => c.id !== action.payload);
      if (state.activeConversationId === action.payload) {
        state.activeConversationId = state.conversations[0]?.id || null;
      }
      saveUserConversations(state.currentUserEmail, state.conversations);
    },
    renameChat(state, action) {
      const { id, title } = action.payload;
      const chat = state.conversations.find(c => c.id === id);
      if (chat) {
        chat.title = title;
        saveUserConversations(state.currentUserEmail, state.conversations);
      }
    },
    updateChatSettings(state, action) {
      const { id, key, value } = action.payload;
      const chat = state.conversations.find(c => c.id === id);
      if (chat) {
        chat[key] = value;
        saveUserConversations(state.currentUserEmail, state.conversations);
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
      const chat = state.conversations.find(c => c.id === chatId);
      if (chat) {
        chat.messages.push(message);
        saveUserConversations(state.currentUserEmail, state.conversations);
      }
    },
    updateLastMessageText(state, action) {
      const { chatId, text } = action.payload;
      const chat = state.conversations.find(c => c.id === chatId);
      if (chat && chat.messages.length > 0) {
        const lastMsg = chat.messages[chat.messages.length - 1];
        if (lastMsg.sender === "assistant") {
          lastMsg.text = text;
          saveUserConversations(state.currentUserEmail, state.conversations);
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
        }
      }
    }
  }
});

export const {
  loadUserConversations,
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
  clearActiveChat,
  editMessage
} = chatSlice.actions;

export default chatSlice.reducer;
