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

const buildSystemPrompt = ({ useGuardrails, useKnowledgeBase, activeKbTitle }) => `You are AI Studio, a concise and helpful assistant.
${useGuardrails ? "Avoid unsafe or disallowed content and explain refusals briefly." : ""}
${useKnowledgeBase && activeKbTitle ? `If the user asks about internal docs, note that the selected knowledge base is "${activeKbTitle}". The frontend has not uploaded documents automatically, so only use knowledge the user actually provides in the prompt.` : ""}`;

const generateResponse = async ({
  model,
  prompt,
  temperature,
  maxTokens,
  useGuardrails,
  useKnowledgeBase,
  activeKbTitle
}) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is missing in the backend environment.");
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "X-Title": OPENROUTER_APP_NAME
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        {
          role: "system",
          content: buildSystemPrompt({ useGuardrails, useKnowledgeBase, activeKbTitle })
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || "The model provider returned an error.");
  }

  return {
    text: extractTextContent(payload?.choices?.[0]?.message?.content) || "The model returned an empty response."
  };
};

module.exports = {
  generateResponse
};
