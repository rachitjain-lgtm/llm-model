import axiosClient from "./axiosClient";

const streamText = (text, streamingOn, onChunk, onDone) => {
  if (!streamingOn) {
    onChunk(text);
    onDone(text);
    return;
  }

  const tokens = text.split(/(\s+)/);
  let index = 0;
  let currentText = "";

  const interval = setInterval(() => {
    if (index >= tokens.length) {
      clearInterval(interval);
      onDone(currentText);
      return;
    }

    currentText += tokens[index];
    onChunk(currentText);
    index += 1;
  }, 15);
};

export const chatApi = {
  fetchUserChats: async () => {
    const res = await axiosClient.get("/chats");
    return res.data.data;
  },

  createChat: async (chatData) => {
    const res = await axiosClient.post("/chats", chatData);
    return res.data.data;
  },

  renameChat: async (chatId, title) => {
    const res = await axiosClient.put(`/chats/${chatId}/title`, { title });
    return res.data.data;
  },

  updateSettings: async (chatId, settings) => {
    const res = await axiosClient.put(`/chats/${chatId}/settings`, settings);
    return res.data.data;
  },

  deleteChat: async (chatId) => {
    const res = await axiosClient.delete(`/chats/${chatId}`);
    return res.data;
  },

  saveMessage: async (chatId, messageData) => {
    const res = await axiosClient.post(`/chats/${chatId}/messages`, messageData);
    return res.data.data;
  },

  sendMessageStream: async ({
    conversation,
    prompt,
    streamingOn,
    activeKb
  }, onChunk, onDone) => {
    const response = await axiosClient.post(`/chats/${conversation.id}/generate`, {
      prompt,
      model: conversation.model,
      temperature: conversation.temperature,
      maxTokens: conversation.maxTokens,
      useGuardrails: conversation.useGuardrails,
      useKnowledgeBase: conversation.useKnowledgeBase,
      activeKbTitle: activeKb?.title || ""
    });

    const finalText = response.data?.data?.text || "The model returned an empty response.";
    const sources = response.data?.data?.sources || null;
    streamText(finalText, streamingOn, onChunk, (streamedText) => onDone(streamedText, sources));
  }
};
