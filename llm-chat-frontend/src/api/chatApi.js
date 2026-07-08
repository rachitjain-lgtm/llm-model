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
    return res.data.data || res.data.chats || res.data;
  },

  createChat: async (chatData) => {
    const res = await axiosClient.post("/chats", chatData);
    return res.data.data || res.data.chat || res.data;
  },

  renameChat: async (chatId, title) => {
    const res = await axiosClient.put(`/chats/${chatId}/title`, { title });
    return res.data.data || res.data.chat || res.data;
  },

  updateSettings: async (chatId, settings) => {
    const res = await axiosClient.put(`/chats/${chatId}/settings`, settings);
    return res.data.data || res.data.chat || res.data;
  },

  deleteChat: async (chatId) => {
    const res = await axiosClient.delete(`/chats/${chatId}`);
    return res.data;
  },

  saveMessage: async (chatId, messageData) => {
    const res = await axiosClient.post(`/chats/${chatId}/messages`, messageData);
    return res.data.data || res.data.message || res.data;
  },

  sendMessageStream: async ({
    conversation,
    prompt,
    attachments,
    streamingOn,
    activeKb,
    signal
  }, onChunk, onDone) => {
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    let token = localStorage.getItem("token");

    let response = await fetch(`${baseURL}/chats/${conversation.id}/generate`, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        prompt,
        attachments,
        model: conversation.model,
        temperature: conversation.temperature,
        maxTokens: conversation.maxTokens,
        useGuardrails: conversation.useGuardrails,
        useKnowledgeBase: conversation.useKnowledgeBase,
        useWebSearch: conversation.useWebSearch,
        activeKbTitle: activeKb?.title || "",
        persona: conversation.persona || "general"
      })
    });

    if (response.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const axios = (await import("axios")).default;
          const refreshRes = await axios.post(
            `${baseURL}/auth/refresh-token`,
            { refreshToken }
          );
          const data = refreshRes.data?.data || refreshRes.data;
          const newAccessToken = data.accessToken;
          const newRefreshToken = data.refreshToken;
          if (newAccessToken) {
            localStorage.setItem("token", newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem("refreshToken", newRefreshToken);
            }
            token = newAccessToken;
            
            response = await fetch(`${baseURL}/chats/${conversation.id}/generate`, {
              method: "POST",
              signal,
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {})
              },
              body: JSON.stringify({
                prompt,
                attachments,
                model: conversation.model,
                temperature: conversation.temperature,
                maxTokens: conversation.maxTokens,
                useGuardrails: conversation.useGuardrails,
                useKnowledgeBase: conversation.useKnowledgeBase,
                useWebSearch: conversation.useWebSearch,
                activeKbTitle: activeKb?.title || "",
                persona: conversation.persona || "general"
              })
            });
          }
        } catch (err) {
          console.error("Fetch token refresh failed:", err);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          window.location.reload();
          throw err;
        }
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.reload();
      }
    }

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.message || `HTTP error ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let accumulatedText = "";
    let finalSources = null;
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        try {
          const payload = JSON.parse(trimmed.slice(6));
          if (payload.error) {
            throw new Error(payload.error);
          }
          if (payload.chunk) {
            accumulatedText += payload.chunk;
            onChunk(accumulatedText);
          }
          if (payload.done) {
            if (payload.text) accumulatedText = payload.text;
            if (payload.sources) finalSources = payload.sources;
          }
        } catch (e) {
          if (e.message && !e.message.includes("JSON")) {
            throw e;
          }
        }
      }
    }

    onDone(accumulatedText || "The model returned an empty response.", finalSources);
  }
};
