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
  const endpoint = config.endpoint || process.env.AZURE_OPENAI_ENDPOINT || '';
  const apiKey = config.apiKey || process.env.AZURE_OPENAI_API_KEY || '';
  const deploymentName = config.deploymentName || process.env.AZURE_OPENAI_DEPLOYMENT || '';
  const apiVersion = config.apiVersion || process.env.AZURE_OPENAI_API_VERSION || '2024-06-01';

  if (!endpoint || !apiKey || !deploymentName) {
    throw new Error('Azure OpenAI config is missing in the provider profile or backend environment.');
  }

  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${encodeURIComponent(deploymentName)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      messages: formatMessages({ systemPrompt, prompt, chatHistory }),
      temperature,
      max_tokens: maxTokens,
      model,
    }),
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message || 'Azure OpenAI returned an error.');
  return { text: extractTextContent(payload?.choices?.[0]?.message?.content) || 'The model returned an empty response.', raw: payload };
};

const generateStreamResponse = async (params, onChunk) => {
  const result = await generateResponse(params);
  if (onChunk && result?.text) onChunk(result.text);
  return { text: result.text };
};

module.exports = { providerName: 'azure', generateResponse, generateStreamResponse };
