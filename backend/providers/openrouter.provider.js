const DEFAULT_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_APP_NAME = 'AI Studio';

const extractTextContent = (content) => {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item === 'string' ? item : item?.type === 'text' ? item.text : ''))
      .join('');
  }
  return '';
};

const MODEL_MAPPINGS = {
  'Claude 3 Sonnet': 'google/gemini-2.5-flash',
  'Claude 3.5 Sonnet': 'google/gemini-2.5-flash',
  'Llama 3 70B': 'meta-llama/llama-3-70b-instruct',
  'DeepSeek R1': 'deepseek/deepseek-r1',
  'DeepSeek V3': 'deepseek/deepseek-chat',
  'Gemini 2.5 Flash': 'google/gemini-2.5-flash',
};

const normalizeModelId = (modelId) => {
  if (!modelId) return 'google/gemini-2.5-flash';
  if (MODEL_MAPPINGS[modelId]) return MODEL_MAPPINGS[modelId];
  if (String(modelId).includes('/')) return modelId;
  return modelId;
};

const formatMessages = ({ systemPrompt, prompt, chatHistory = [] }) => ([
  ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
  ...chatHistory.map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.content || m.text || '' })),
  { role: 'user', content: prompt },
]);

const generateResponse = async ({ model, prompt, chatHistory = [], systemPrompt, temperature = 0.7, maxTokens = 2048, config = {} }) => {
  const apiKey = config.apiKey || process.env.OPENROUTER_API_KEY;
  const apiUrl = config.apiBaseUrl || process.env.OPENROUTER_API_URL || DEFAULT_API_URL;
  const appName = config.appName || process.env.OPENROUTER_APP_NAME || DEFAULT_APP_NAME;

  if (!apiKey) throw new Error('OPENROUTER_API_KEY is missing in the backend environment or provider profile.');

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-Title': appName,
    },
    body: JSON.stringify({
      model: normalizeModelId(model),
      temperature,
      max_tokens: Math.min(maxTokens, 4096),
      messages: formatMessages({ systemPrompt, prompt, chatHistory }),
    }),
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message || 'OpenRouter returned an error.');

  return { text: extractTextContent(payload?.choices?.[0]?.message?.content) || 'The model returned an empty response.', raw: payload };
};

const generateStreamResponse = async (params, onChunk) => {
  const result = await generateResponse(params);
  if (onChunk && result?.text) onChunk(result.text);
  return { text: result.text };
};

module.exports = { providerName: 'openrouter', generateResponse, generateStreamResponse };
