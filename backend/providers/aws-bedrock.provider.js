const extractTextContent = (content) => {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item === 'string' ? item : item?.type === 'text' ? item.text : ''))
      .join('');
  }
  return ''; amodule 
};

const formatMessages = ({ systemPrompt, prompt, chatHistory = [] }) => ([
  ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
  ...chatHistory.map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.content || m.text || '' })),
  { role: 'user', content: prompt },
]);

const generateResponse = async ({ model = 'anthropic.claude-3-5-sonnet', prompt, chatHistory = [], systemPrompt, temperature = 0.7, maxTokens = 2048, config = {} }) => {
  const apiKey = config.apiKey || process.env.AWS_BEDROCK_API_KEY || '';
  const apiUrl = config.apiBaseUrl || process.env.AWS_BEDROCK_API_URL || 'https://bedrock-runtime.us-east-1.amazonaws.com/model';
  const modelId = config.modelId || process.env.BEDROCK_MODEL_ID || model;

  if (!apiKey) {
    throw new Error('AWS Bedrock config is missing in the provider profile or backend environment.');
  }

  const response = await fetch(`${apiUrl}/${encodeURIComponent(modelId)}/converse`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: formatMessages({ systemPrompt, prompt, chatHistory }),
      inferenceConfig: {
        temperature,
        maxTokens,
      },
      guardrailId: config.guardrailId || process.env.GUARDRAIL_ID || undefined,
      knowledgeBaseId: config.knowledgeBaseId || process.env.KNOWLEDGE_BASE_ID || undefined,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || 'AWS Bedrock returned an error.');
  return { text: extractTextContent(payload?.output?.message?.content) || 'The model returned an empty response.', raw: payload };
};

const generateStreamResponse = async (params, onChunk) => {
  const result = await generateResponse(params);
  if (onChunk && result?.text) onChunk(result.text);
  return { text: result.text };
};

module.exports = { providerName: 'aws-bedrock', generateResponse, generateStreamResponse };
