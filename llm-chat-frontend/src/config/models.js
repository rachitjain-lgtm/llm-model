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
  }
];

export const DEFAULT_MODEL_ID = "deepseek/deepseek-r1";

export function getModelLabel(modelId) {
  if (!modelId || modelId === "Claude 3 Sonnet" || modelId.includes("Claude")) {
    return "DeepSeek R1";
  }
  return MODEL_OPTIONS.find((model) => model.id === modelId)?.label || modelId;
}
