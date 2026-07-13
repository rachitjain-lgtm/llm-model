const DEFAULT_API_URL = 'https://api.openai.com/v1/chat/completions';

const extractTextContent = (content) => {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item === 'string' ? item : item?.type === 'text' ? item.text : ''))
      .join('');
  }
  return '';
};

const formatMessages = ({ systemPrompt, prompt, chatHistory = [] }) => ([
  ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
  ...chatHistory.map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.content || m.text || '' })),
  { role: 'user', content: prompt },
]);

const generateResponse = async ({ model = 'gpt-4o-mini', prompt, chatHistory = [], systemPrompt, temperature = 0.7, maxTokens = 2048, config = {} }) => {
  const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
  const apiUrl = config.apiBaseUrl || process.env.OPENAI_API_URL || DEFAULT_API_URL;
  if (!apiKey) throw new Error('OPENAI_API_KEY is missing in the backend environment or provider profile.');

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: formatMessages({ systemPrompt, prompt, chatHistory }),
    }),
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message || 'OpenAI returned an error.');
  return { text: extractTextContent(payload?.choices?.[0]?.message?.content) || 'The model returned an empty response.', raw: payload };
};

const generateStreamResponse = async (params, onChunk) => {
  const result = await generateResponse(params);
  if (onChunk && result?.text) onChunk(result.text);
  return { text: result.text };
};

module.exports = { providerName: 'openai', generateResponse, generateStreamResponse };
