import axiosClient from "./axiosClient";

const FALLBACK_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const extractTextContent = (content) => {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item?.type === "text") {
          return item.text;
        }

        return "";
      })
      .join("");
  }

  return "";
};

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
    apiKey,
    appName,
    streamingOn,
    activeKb
  }, onChunk, onDone) => {
    const sources = conversation.useKnowledgeBase && activeKb
      ? [{ title: activeKb.title, url: "#" }]
      : null;

    if (!apiKey) {
      const helperText = `Add an OpenRouter API key in Settings to start calling free models.

This frontend is wired for real requests now, but it needs a user-supplied key before it can send prompts. Your key is stored locally in this browser only.`;

      streamText(helperText, streamingOn, onChunk, (finalText) => onDone(finalText, sources));
      return;
    }

    const systemPrompt = `You are AI Studio, a concise and helpful assistant.
${conversation.useGuardrails ? "Avoid unsafe or disallowed content and explain refusals briefly." : ""}
${conversation.useKnowledgeBase && activeKb ? `If the user asks about internal docs, note that the selected knowledge base is "${activeKb.title}". The frontend has not uploaded documents automatically, so only use knowledge the user actually provides in the prompt.` : ""}`;

    const response = await fetch(FALLBACK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": appName || "AI Studio"
      },
      body: JSON.stringify({
        model: conversation.model,
        temperature: conversation.temperature,
        max_tokens: conversation.maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ]
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.error?.message || "The model provider returned an error.");
    }

    const finalText = extractTextContent(payload?.choices?.[0]?.message?.content) || "The model returned an empty response.";
    streamText(finalText, streamingOn, onChunk, (streamedText) => onDone(streamedText, sources));
  }
};
