const extractTextContent = (content) => {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item === 'string' ? item : item?.generated_text || item?.text || ''))
      .join('');
  }
  return content?.generated_text || '';
};

const formatPrompt = ({ systemPrompt, prompt, chatHistory = [] }) => {
  const historyText = chatHistory
    .map((message) => `${message.sender === 'user' ? 'User' : 'Assistant'}: ${message.content || message.text || ''}`)
    .join('\n');

  return [systemPrompt, historyText, `User: ${prompt}`, 'Assistant:']
    .filter(Boolean)
    .join('\n\n');
};

const generateResponse = async ({ model = 'mistralai/Mistral-7B-Instruct-v0.3', prompt, chatHistory = [], systemPrompt, temperature = 0.7, maxTokens = 2048, config = {} }) => {
  const apiKey = config.apiKey || process.env.HUGGINGFACE_API_KEY || '';
  const apiUrl = config.apiBaseUrl || process.env.HUGGINGFACE_API_URL || 'https://api-inference.huggingface.co/models';
  if (!apiKey) throw new Error('HUGGINGFACE_API_KEY is missing in the backend environment or provider profile.');

  const response = await fetch(`${apiUrl}/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: formatPrompt({ systemPrompt, prompt, chatHistory }),
      parameters: {
        temperature,
        max_new_tokens: maxTokens,
        return_full_text: false,
      },
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || 'Hugging Face returned an error.');
  return { text: extractTextContent(payload) || 'The model returned an empty response.', raw: payload };
};

const generateStreamResponse = async (params, onChunk) => {
  const result = await generateResponse(params);
  if (onChunk && result?.text) onChunk(result.text);
  return { text: result.text };
};

module.exports = { providerName: 'huggingface', generateResponse, generateStreamResponse };
