export const BUILTIN_PROVIDER_PROFILES = [
  {
    id: "openrouter",
    name: "OpenRouter Default",
    providerType: "openrouter",
    isBuiltin: true,
    models: [
      { id: "deepseek/deepseek-r1", label: "DeepSeek R1" },
      { id: "deepseek/deepseek-chat", label: "DeepSeek V3" },
      { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
      { id: "x-ai/grok-4.3", label: "Grok 4.3" },
      { id: "google/gemma-3-12b-it", label: "Gemma 3 12B" },
      { id: "mistralai/mistral-small-3.2-24b-instruct", label: "Mistral Small 3.2 24B" },
      { id: "qwen/qwen3-coder", label: "Qwen 3 Coder" },
      { id: "qwen/qwen3-vl-32b-instruct", label: "Qwen 3 VL (Vision)" }
    ]
  },
  {
    id: "nvidia",
    name: "NVIDIA Default",
    providerType: "nvidia",
    isBuiltin: true,
    models: [
      { id: "meta/llama-3.1-8b-instruct", label: "Llama 3.1 8B" },
      { id: "meta/llama-3.1-70b-instruct", label: "Llama 3.1 70B" },
      { id: "meta/llama-3.3-70b-instruct", label: "Llama 3.3 70B (NVIDIA)" },
      { id: "meta/llama-3.2-11b-vision-instruct", label: "Llama 3.2 Vision (NVIDIA)" }
    ]
  }
];

export const PROVIDER_OPTIONS = [
  { id: "openrouter", label: "OpenRouter" },
  { id: "nvidia", label: "NVIDIA" }
];

export const PROVIDER_FIELD_PRESETS = {
  openrouter: {
    fields: ["apiKey", "apiBaseUrl", "appName"],
    label: "OpenRouter",
  },
  nvidia: {
    fields: ["apiKey", "apiBaseUrl"],
    label: "NVIDIA",
  }
};

export const FIELD_LABELS = {
  apiKey: "API Key",
  apiBaseUrl: "API Base URL",
  appName: "App Name",
  endpoint: "Endpoint",
  deploymentName: "Deployment Name",
  apiVersion: "API Version",
  awsRegion: "AWS Region",
  accessKeyId: "AWS Access Key ID",
  secretAccessKey: "AWS Secret Access Key",
  modelId: "Model ID",
  knowledgeBaseId: "Knowledge Base ID",
  guardrailId: "Guardrail ID",
};

export const DEFAULT_MODEL_ID = "google/gemini-2.5-flash";

export function normalizeProviderKey(provider) {
  return String(provider || "openrouter").toLowerCase().trim();
}

export function getAllProviderProfiles(customProfiles = []) {
  return [...BUILTIN_PROVIDER_PROFILES, ...customProfiles];
}

export function getProviderProfileLabel(profile) {
  if (!profile) return "Unknown Provider";
  return profile.name || profile.label || profile.providerType || profile.id;
}

export function getProviderProfileByKey(providerKey, providerProfiles = []) {
  const key = normalizeProviderKey(providerKey);
  return getAllProviderProfiles(providerProfiles).find((profile) => profile.id === key) || null;
}

export function getModelsForProvider(providerKey, providerProfiles = []) {
  const profile = getProviderProfileByKey(providerKey, providerProfiles);
  if (profile?.models?.length) return profile.models;

  const providerType = normalizeProviderKey(providerKey);
  const builtin = BUILTIN_PROVIDER_PROFILES.find((p) => p.providerType === providerType || p.id === providerType);
  return builtin?.models || BUILTIN_PROVIDER_PROFILES[0].models;
}

export function getDefaultModelForProvider(providerKey, providerProfiles = []) {
  return getModelsForProvider(providerKey, providerProfiles)[0]?.id || DEFAULT_MODEL_ID;
}

export function getModelLabel(modelId, providerProfiles = []) {
  const allModels = BUILTIN_PROVIDER_PROFILES.flatMap((profile) => profile.models)
    .concat((providerProfiles || []).flatMap((profile) => profile.models || []));
  return allModels.find((model) => model.id === modelId)?.label || modelId || "Unknown model";
}

export function getProviderTypeLabel(providerType) {
  return PROVIDER_OPTIONS.find((provider) => provider.id === normalizeProviderKey(providerType))?.label || providerType;
}

export const AI_PERSONAS = [
  { id: "general", label: "General Assistant", prompt: "You are a concise, accurate, and helpful AI assistant." },
  { id: "engineer", label: "Senior Software Engineer", prompt: "You are a senior software engineer. Focus on clean code, design patterns, security, and performance." },
  { id: "analyst", label: "Data Analyst", prompt: "You are an expert data analyst. Focus on structured data, SQL queries, metrics, insights, and data visualization." },
  { id: "writer", label: "Creative Writer", prompt: "You are a skilled creative writer and editor. Use engaging tone, rich phrasing, and polished narrative structure." }
];
