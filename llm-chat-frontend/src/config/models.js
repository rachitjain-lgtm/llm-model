export const MODEL_OPTIONS = [
  {
    id: "meta-llama/llama-3.3-8b-instruct:free",
    label: "Llama 3.3 8B Free",
    provider: "OpenRouter"
  },
  {
    id: "google/gemma-3-12b-it:free",
    label: "Gemma 3 12B Free",
    provider: "OpenRouter"
  },
  {
    id: "mistralai/mistral-small-3.2-24b-instruct:free",
    label: "Mistral Small 3.2 Free",
    provider: "OpenRouter"
  },
  {
    id: "qwen/qwen3-coder:free",
    label: "Qwen 3 Coder Free",
    provider: "OpenRouter"
  }
];

export const DEFAULT_MODEL_ID = MODEL_OPTIONS[0].id;

export function getModelLabel(modelId) {
  return MODEL_OPTIONS.find((model) => model.id === modelId)?.label || modelId;
}
