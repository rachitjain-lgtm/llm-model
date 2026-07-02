const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');

const sampleConversations = [
  {
    title: "AI Assistant overview",
    model: "Claude 3 Sonnet",
    messages: [
      { sender: "user", content: "Can you explain how this Cloud AI platform works and its key features?" },
      { sender: "assistant", content: `The Cloud AI platform is a fully managed service that offers a choice of high-performing foundation models (FMs) from leading AI companies through a single API, along with a broad set of capabilities you need to build generative AI applications with security, privacy, and responsible AI.\n\n### Key features\n\n* **Choice of leading foundation models**: Access Claude, Llama, Titan, etc.\n* **Serverless experience**: Fully managed, no infrastructure to set up.\n* **Data privacy and security**: Your data is encrypted and remains within your VPC.\n* **Responsible AI with guardrails**: Implement safety thresholds for content filters.\n* **Knowledge Bases for RAG applications**: Build customized AI connected to your private documentation.\n\nLearn more in the platform documentation.` }
    ]
  },
  {
    title: "Compare Claude vs Llama",
    model: "Claude 3 Sonnet",
    messages: [
      { sender: "user", content: "Compare Claude 3 Sonnet vs Llama 3 70B" },
      { sender: "assistant", content: `Here is a quick comparison of Claude 3 Sonnet and Llama 3 70B:\n\n1. **Developer**: Claude 3 Sonnet is created by Anthropic, while Llama 3 70B is created by Meta.\n2. **Strengths**: Claude is outstanding for complex reasoning, multilingual processing, and writing clean code. Llama 3 70B is highly cost-effective and performs exceptionally for dialogue, summarization, and general instructions.\n3. **Context Window**: Claude 3 Sonnet supports up to 200k tokens, providing robust long-document support. Llama 3 70B supports 8k tokens.` }
    ]
  },
  {
    title: "Summarize product docs",
    model: "Claude 3 Sonnet",
    messages: [
      { sender: "user", content: "Can you help me summarize my product docs?" },
      { sender: "assistant", content: "Sure! Please paste the product documentation here, or verify that your Product Docs Knowledge Base is turned on in the bottom composer or the run controls panel so I can reference it." }
    ]
  },
  {
    title: "Create SQL query",
    model: "Claude 3 Sonnet",
    messages: [
      { sender: "user", content: "Write a SQL query to find users who signed up in the last 30 days and ordered more than $100." },
      { sender: "assistant", content: `Here is the SQL query to retrieve that user list:\n\n\`\`\`sql\nSELECT u.id, u.name, u.email, SUM(o.amount) as total_spent\nFROM users u\nJOIN orders o ON u.id = o.user_id\nWHERE u.signup_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)\nGROUP BY u.id\nHAVING total_spent > 100;\n\`\`\`` }
    ]
  },
  {
    title: "Marketing campaign ideas",
    model: "Llama 3 70B",
    messages: [
      { sender: "user", content: "List 5 creative ideas for B2B SaaS launch campaign." },
      { sender: "assistant", content: `Here are 5 creative campaign ideas for your B2B SaaS launch:\n\n1. **The Interactive Audit Tool**: A quick 2-minute calculator showing prospects exactly where they are losing revenue, leading directly to your signup flow.\n2. **Private Beta Behind-the-Scenes Vlogs**: A weekly series featuring founders discussing scaling challenges, humanizing the product and generating organic traction.\n3. **The "Anti-Complexity" Web Series**: Short, funny videos highlighting the manual processes your tool eliminates.\n4. **Industry Leader Roundtable**: Invite top minds for a virtual panel on current issues, showcasing your SaaS as a thought leader in the space.\n5. **Co-branded Infographics**: Partner with a non-competing tool to co-publish an insightful industry dataset, widening your reach.` }
    ]
  }
];

const getUserChats = async (userId, userEmail) => {
  const db = getDb();
  const chatsCollection = db.collection('chats');
  const messagesCollection = db.collection('messages');

  let chats = await chatsCollection.find({ userId: new ObjectId(userId) }).sort({ updatedAt: -1 }).toArray();
  
  // Seeding logic: ONLY aashipndy1710@gmail.com gets demo sample chats if 0 chats exist.
  if (chats.length === 0) {
    if (userEmail && userEmail.toLowerCase().trim() === 'aashipndy1710@gmail.com') {
      for (const sample of sampleConversations) {
        const insertResult = await chatsCollection.insertOne({
          userId: new ObjectId(userId),
          title: sample.title,
          model: sample.model,
          provider: 'Cloud AI',
          settings: { maxTokens: 4096, temperature: 0.7, useGuardrails: true, useKnowledgeBase: false },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        for (const msg of sample.messages) {
          await messagesCollection.insertOne({
            chatId: insertResult.insertedId,
            sender: msg.sender,
            content: msg.content,
            tokens: 0,
            createdAt: new Date(),
          });
        }
      }
    } else {
      // For all other new users, seed 1 empty chat so onboarding cards ("Choose model") render automatically
      await chatsCollection.insertOne({
        userId: new ObjectId(userId),
        title: 'New Conversation',
        model: 'Claude 3 Sonnet',
        provider: 'Cloud AI',
        settings: { maxTokens: 4096, temperature: 0.7, useGuardrails: true, useKnowledgeBase: false },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    chats = await chatsCollection.find({ userId: new ObjectId(userId) }).sort({ updatedAt: -1 }).toArray();
  }

  // Attach messages
  const result = await Promise.all(
    chats.map(async (chat) => {
      const messages = await messagesCollection.find({ chatId: chat._id }).sort({ createdAt: 1 }).toArray();
      return {
        id: chat._id.toString(),
        title: chat.title,
        model: chat.model || 'Claude 3 Sonnet',
        provider: chat.provider || 'Cloud AI',
        settings: chat.settings || {},
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messages: messages.map((m) => ({
          id: m._id.toString(),
          sender: m.sender,
          text: m.content,
          tokens: m.tokens || 0,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })),
      };
    })
  );

  return result;
};

const getChatById = async (chatId, userId) => {
  const db = getDb();
  const chat = await db.collection('chats').findOne({ _id: new ObjectId(chatId), userId: new ObjectId(userId) });
  if (!chat) {
    throw new Error('Chat not found');
  }
  const messages = await db.collection('messages').find({ chatId: chat._id }).sort({ createdAt: 1 }).toArray();
  return {
    id: chat._id.toString(),
    title: chat.title,
    model: chat.model,
    provider: chat.provider,
    settings: chat.settings,
    createdAt: chat.createdAt,
    messages: messages.map((m) => ({
      id: m._id.toString(),
      sender: m.sender,
      text: m.content,
      tokens: m.tokens || 0,
      time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })),
  };
};

const createChat = async (userId, data = {}) => {
  const db = getDb();
  const newChat = {
    userId: new ObjectId(userId),
    title: data.title || 'New Conversation',
    model: data.model || 'Claude 3 Sonnet',
    provider: data.provider || 'Cloud AI',
    settings: data.settings || { maxTokens: 4096, temperature: 0.7, useGuardrails: true, useKnowledgeBase: false },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection('chats').insertOne(newChat);

  return {
    id: result.insertedId.toString(),
    title: newChat.title,
    model: newChat.model,
    provider: newChat.provider,
    settings: newChat.settings,
    createdAt: newChat.createdAt,
    messages: [],
  };
};

const renameChat = async (chatId, userId, title) => {
  const db = getDb();
  const result = await db.collection('chats').findOneAndUpdate(
    { _id: new ObjectId(chatId), userId: new ObjectId(userId) },
    { $set: { title, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  if (!result) {
    throw new Error('Chat not found or unauthorized');
  }
  return result;
};

const updateChatSettings = async (chatId, userId, settings) => {
  const db = getDb();
  const chat = await db.collection('chats').findOne({ _id: new ObjectId(chatId), userId: new ObjectId(userId) });
  if (!chat) {
    throw new Error('Chat not found or unauthorized');
  }
  const updatedSettings = { ...chat.settings, ...settings };
  await db.collection('chats').updateOne(
    { _id: new ObjectId(chatId) },
    { $set: { settings: updatedSettings, updatedAt: new Date() } }
  );
  return { ...chat, settings: updatedSettings };
};

const deleteChat = async (chatId, userId) => {
  const db = getDb();
  const result = await db.collection('chats').deleteOne({ _id: new ObjectId(chatId), userId: new ObjectId(userId) });
  if (result.deletedCount === 0) {
    throw new Error('Chat not found or unauthorized');
  }
  await db.collection('messages').deleteMany({ chatId: new ObjectId(chatId) });
  return true;
};

const addMessageToChat = async (chatId, userId, { sender, content, tokens }) => {
  const db = getDb();
  const chat = await db.collection('chats').findOne({ _id: new ObjectId(chatId), userId: new ObjectId(userId) });
  if (!chat) {
    throw new Error('Chat not found or unauthorized');
  }

  const newMessage = {
    chatId: new ObjectId(chatId),
    sender,
    content,
    tokens: tokens || 0,
    createdAt: new Date(),
  };

  const result = await db.collection('messages').insertOne(newMessage);

  await db.collection('chats').updateOne(
    { _id: new ObjectId(chatId) },
    { $set: { updatedAt: new Date() } }
  );

  return {
    id: result.insertedId.toString(),
    sender: newMessage.sender,
    text: newMessage.content,
    tokens: newMessage.tokens,
    time: new Date(newMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
};

module.exports = {
  getUserChats,
  getChatById,
  createChat,
  renameChat,
  updateChatSettings,
  deleteChat,
  addMessageToChat,
};