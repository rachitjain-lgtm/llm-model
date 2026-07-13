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

const generateResponse = async ({ model = 'meta/llama-3.1-70b-instruct', prompt, chatHistory = [], systemPrompt, temperature = 0.7, maxTokens = 2048, config = {} }) => {
  const apiKey = config.apiKey || process.env.NVIDIA_API_KEY;
  const apiUrl = config.apiBaseUrl || process.env.NVIDIA_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
  if (!apiKey) throw new Error('NVIDIA_API_KEY is missing in the backend environment or provider profile.');

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
  if (!response.ok) throw new Error(payload?.error?.message || 'NVIDIA returned an error.');
  return { text: extractTextContent(payload?.choices?.[0]?.message?.content) || 'The model returned an empty response.', raw: payload };
};

const generateStreamResponse = async (params, onChunk) => {
  const result = await generateResponse(params);
  if (onChunk && result?.text) onChunk(result.text);
  return { text: result.text };
};

module.exports = { providerName: 'nvidia', generateResponse, generateStreamResponse };
