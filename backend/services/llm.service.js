const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_APP_NAME = process.env.OPENROUTER_APP_NAME || "AI Studio";

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

const MODEL_MAPPINGS = {
  "Claude 3 Sonnet": "google/gemini-2.5-flash",
  "Claude 3.5 Sonnet": "google/gemini-2.5-flash",
  "Llama 3 70B": "meta-llama/llama-3-70b-instruct",
  "DeepSeek R1": "deepseek/deepseek-r1",
  "DeepSeek V3": "deepseek/deepseek-chat",
  "Gemini 2.5 Flash": "google/gemini-2.5-flash"
};

const normalizeModelId = (modelId) => {
  if (!modelId) return "google/gemini-2.5-flash";
  if (MODEL_MAPPINGS[modelId]) return MODEL_MAPPINGS[modelId];
  if (modelId.includes("/")) return modelId;
  return "google/gemini-2.5-flash";
};

const { searchWeb } = require("./search.service");

const DANGEROUS_PATTERNS = [
  /how to (make|build|create|synthesize) (a bomb|explosives|weapon of mass destruction|napalm)/i,
  /how to (hack|crack|bypass) (passwords|bank accounts|credit cards|user credentials)/i,
  /generate (malware|ransomware|keylogger|trojan|phishing script)/i
];

const checkGuardrailViolation = (prompt) => {
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(prompt));
};

const buildSystemPrompt = ({ useKnowledgeBase, activeKbTitle, searchResults, otherChatsSummary }) => {
  let prompt = "You are AI Studio, a concise, accurate, and helpful AI assistant.\n";
  
  const currentDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  prompt += `Current System Date: Today is ${currentDateStr}. You have access to real-time search context. Never claim you do not have live data or are restricted to past training data, because real-time internet search context is provided.\n`;
  prompt += "Safety Guardrails Active: You must refuse requests to generate harmful, illegal, dangerous, or disallowed content and explain refusals politely.\n";

  if (useKnowledgeBase && activeKbTitle) {
    prompt += `If the user asks about internal docs, note that the selected knowledge base is "${activeKbTitle}". The frontend has not uploaded documents automatically, so only use knowledge the user actually provides in the prompt.\n`;
  }
  if (searchResults && searchResults.length > 0) {
    prompt += `\n--- LIVE WEB SEARCH CONTEXT (DuckDuckGo Real-Time Search) ---\n`;
    searchResults.forEach((r, i) => {
      prompt += `Source [${i+1}]: ${r.title}\nURL: ${r.url}\nSummary: ${r.snippet}\n\n`;
    });
    prompt += `INSTRUCTIONS: Use the Live Web Search Context above to provide specific, accurate, up-to-date answers (including street addresses, location details, contacts, or current events). Cite sources where applicable.\n--- END SEARCH CONTEXT ---\n`;
  }
  if (otherChatsSummary) {
    prompt += `\n--- USER'S OTHER SAVED CONVERSATIONS ---\nThe user is asking about their other chat boxes or past conversations. Below is context from their other saved chat sessions:\n\n${otherChatsSummary}\n--- END OTHER CONVERSATIONS ---\n`;
  }
  return prompt;
};

const generateResponse = async ({
  model,
  prompt,
  chatHistory = [],
  otherChatsSummary = "",
  temperature,
  maxTokens,
  useKnowledgeBase,
  activeKbTitle,
  persona
}) => {
  // Always active Guardrail check
  if (checkGuardrailViolation(prompt)) {
    return {
      text: "🛡️ **[Guardrails Refusal]**: Request blocked. The system detected content that violates safety policies. Please ask a safe query."
    };
  }

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is missing in the backend environment.");
  }

  // Always active Web Search Grounding
  const searchResults = await searchWeb(prompt);

  const formattedHistory = chatHistory.map(m => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    content: m.content || m.text || ""
  }));

  let userPromptWithSearch = prompt;
  if (searchResults && searchResults.length > 0) {
    let searchContextStr = `\n\n[REAL-TIME LIVE INTERNET DATA FOR THIS QUERY]:\n`;
    searchResults.forEach((r, i) => {
      searchContextStr += `Result ${i+1}: ${r.title}\nDetails: ${r.snippet}\nSource URL: ${r.url}\n`;
    });
    searchContextStr += `\nCRITICAL INSTRUCTION: Live real-time internet data is provided above. You MUST use this data to answer the user's request accurately and directly. Do NOT say you lack live data or real-time access, because the live data is supplied above.`;
    userPromptWithSearch += searchContextStr;
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "X-Title": OPENROUTER_APP_NAME
    },
    body: JSON.stringify({
      model: normalizeModelId(model),
      temperature: temperature ?? 0.7,
      max_tokens: Math.min(maxTokens || 2048, 4096),
      messages: [
        {
          role: "system",
          content: buildSystemPrompt({ useKnowledgeBase, activeKbTitle, persona, searchResults, otherChatsSummary })
        },
        ...formattedHistory,
        {
          role: "user",
          content: userPromptWithSearch
        }
      ]
    })
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || "The model provider returned an error.");
  }

  return {
    text: extractTextContent(payload?.choices?.[0]?.message?.content) || "The model returned an empty response.",
    sources: searchResults.length > 0 ? searchResults.map(r => ({ title: r.title, url: r.url })) : null
  };
};

const generateStreamResponse = async ({
  model,
  prompt,
  chatHistory = [],
  otherChatsSummary = "",
  temperature,
  maxTokens,
  useKnowledgeBase,
  activeKbTitle,
  persona
}, onChunk) => {
  // Always active Guardrail check
  if (checkGuardrailViolation(prompt)) {
    const refusalMsg = "🛡️ **[Guardrails Refusal]**: Request blocked. The system detected content that violates safety policies. Please ask a safe query.";
    onChunk(refusalMsg);
    return { text: refusalMsg };
  }

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is missing in the backend environment.");
  }

  // Always active Web Search Grounding
  const searchResults = await searchWeb(prompt);

  const formattedHistory = chatHistory.map(m => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    content: m.content || m.text || ""
  }));

  let userPromptWithSearch = prompt;
  if (searchResults && searchResults.length > 0) {
    let searchContextStr = `\n\n[REAL-TIME LIVE INTERNET DATA FOR THIS QUERY]:\n`;
    searchResults.forEach((r, i) => {
      searchContextStr += `Result ${i+1}: ${r.title}\nDetails: ${r.snippet}\nSource URL: ${r.url}\n`;
    });
    searchContextStr += `\nCRITICAL INSTRUCTION: Live real-time internet data is provided above. You MUST use this data to answer the user's request accurately and directly. Do NOT say you lack live data or real-time access, because the live data is supplied above.`;
    userPromptWithSearch += searchContextStr;
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "X-Title": OPENROUTER_APP_NAME
    },
    body: JSON.stringify({
      model: normalizeModelId(model),
      temperature: temperature ?? 0.7,
      max_tokens: Math.min(maxTokens || 2048, 4096),
      stream: true,
      messages: [
        {
          role: "system",
          content: buildSystemPrompt({ useKnowledgeBase, activeKbTitle, persona, searchResults, otherChatsSummary })
        },
        ...formattedHistory,
        {
          role: "user",
          content: userPromptWithSearch
        }
      ]
    })
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error?.message || `The model provider returned an error (${response.status}).`);
  }

  let fullText = "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(":")) continue;
      if (trimmed === "data: [DONE]") continue;

      if (trimmed.startsWith("data: ")) {
        try {
          const jsonStr = trimmed.slice(6);
          const parsed = JSON.parse(jsonStr);
          const delta = parsed?.choices?.[0]?.delta?.content || "";
          if (delta) {
            fullText += delta;
            if (onChunk) onChunk(delta);
          }
        } catch (e) {
          // Ignore partial JSON line parse errors until line completes
        }
      }
    }
  }

  if (buffer.trim() && buffer.trim().startsWith("data: ") && buffer.trim() !== "data: [DONE]") {
    try {
      const jsonStr = buffer.trim().slice(6);
      const parsed = JSON.parse(jsonStr);
      const delta = parsed?.choices?.[0]?.delta?.content || "";
      if (delta) {
        fullText += delta;
        if (onChunk) onChunk(delta);
      }
    } catch (e) { }
  }

  return {
    text: fullText || "The model returned an empty response.",
    sources: searchResults.length > 0 ? searchResults.map(r => ({ title: r.title, url: r.url })) : null
  };
};

module.exports = {
  generateResponse,
  generateStreamResponse
};

