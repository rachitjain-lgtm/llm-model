export const MODEL_OPTIONS = [
  {
    id: "deepseek/deepseek-r1",
    label: "DeepSeek R1",
    provider: "OpenRouter"
  },
  {
    id: "deepseek/deepseek-chat",
    label: "DeepSeek V3",
    provider: "OpenRouter"
  },
  {
    id: "google/gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    provider: "OpenRouter"
  },
  {
    id: "x-ai/grok-4.3",
    label: "Grok 4.3",
    provider: "OpenRouter"
  },
  {
    id: "google/gemma-3-12b-it",
    label: "Gemma 3 12B",
    provider: "OpenRouter"
  },
  {
    id: "mistralai/mistral-small-3.2-24b-instruct",
    label: "Mistral Small 3.2 24B",
    provider: "OpenRouter"
  },
  {
    id: "qwen/qwen3-coder",
    label: "Qwen 3 Coder",
    provider: "OpenRouter"
  },
  {
    id: "qwen/qwen3-vl-32b-instruct",
    label: "Qwen 3 VL (Vision)",
    provider: "OpenRouter"
  },
  {
    id: "nvidia/llama-3.1-nemotron-70b-instruct",
    label: "Nemotron 70B (NVIDIA)",
    provider: "NVIDIA"
  },
  {
    id: "meta/llama-3.3-70b-instruct",
    label: "Llama 3.3 70B (NVIDIA)",
    provider: "NVIDIA"
  },
  {
    id: "meta/llama-3.2-11b-vision-instruct",
    label: "Llama 3.2 Vision (NVIDIA)",
    provider: "NVIDIA"
  }
];

export const DEFAULT_MODEL_ID = "google/gemini-2.5-flash";

export function getModelLabel(modelId) {
  if (!modelId || modelId === "Claude 3 Sonnet" || modelId.includes("Claude")) {
    return "Gemini 2.5 Flash";
  }
  return MODEL_OPTIONS.find((model) => model.id === modelId)?.label || modelId;
}

export const AI_PERSONAS = [
  { id: "general", label: "General Assistant", prompt: "You are a concise, accurate, and helpful AI assistant." },
  { id: "engineer", label: "Senior Software Engineer", prompt: "You are a senior software engineer. Focus on clean code, design patterns, security, and performance." },
  { id: "analyst", label: "Data Analyst", prompt: "You are an expert data analyst. Focus on structured data, SQL queries, metrics, insights, and data visualization." },
  { id: "writer", label: "Creative Writer", prompt: "You are a skilled creative writer and editor. Use engaging tone, rich phrasing, and polished narrative structure." }
];

