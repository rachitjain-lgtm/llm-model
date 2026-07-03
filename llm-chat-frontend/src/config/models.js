export const MODEL_OPTIONS = [
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

export const DEFAULT_MODEL_ID = MODEL_OPTIONS[0].id;

export function getModelLabel(modelId) {
  return MODEL_OPTIONS.find((model) => model.id === modelId)?.label || modelId;
}
