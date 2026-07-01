// Mock API for chat actions with simulated streaming
export const chatApi = {
  sendMessageStream: (chatId, text, model, useKnowledgeBase, onChunk, onDone) => {
    let responseText = "";
    let sources = null;

    const lower = text.toLowerCase();
    
    if (lower.includes("explain rag") || lower.includes("rag") || lower.includes("retrieval")) {
      responseText = `RAG (Retrieval-Augmented Generation) combines a foundation model with your own external data sources.

Here is how it works on Cloud AI platforms:
1. **Query Translation**: The user input is converted into search terms.
2. **Retrieval**: The system queries the connected Knowledge Base (e.g., Pinecone, OpenSearch, Aurora) to fetch relevant chunks.
3. **Augmentation**: The prompt is augmented with the retrieved contexts.
4. **Generation**: The model generates an accurate, context-grounded response.

**Benefits**:
- Eliminates model hallucinations by grounding in real data.
- Up-to-date responses without expensive retraining.
- Security filters match the source document permissions.`;
      
      if (useKnowledgeBase) {
        sources = [
          {
            title: "Cloud AI RAG Architecture",
            url: "https://example.com/docs/rag-architecture"
          }
        ];
      }
    } else if (lower.includes("hello") || lower.includes("hi")) {
      responseText = `Hello! I am your AI Assistant, running on **${model}**. How can I assist you with your workloads, code queries, or knowledge base searches today?`;
    } else if (lower.includes("compare") || lower.includes("claude") || lower.includes("llama")) {
      responseText = `Here is a quick overview of the active models:

- **Claude 3 Sonnet**: Best balance of speed and advanced intelligence. Ideal for coding, complex logical reasoning, and long documents.
- **Claude 3 Haiku**: Ultra-fast and highly cost-efficient. Great for simple prompts, categorization, and high-volume tasks.
- **Llama 3 70B**: Powerful open-weights model by Meta. Strong command compliance and excellent dialogue quality.
- **Titan Text G1 - Premier**: High-performance foundation model optimized for enterprise workflows.`;
    } else if (lower.includes("sql") || lower.includes("query") || lower.includes("code")) {
      responseText = `Here is a sample code snippet based on your request:

\`\`\`javascript
// Cloud AI Client Example
import { CloudAIClient, InvokeModelCommand } from "@cloud-ai/client-sdk";

const client = new CloudAIClient({ apiKey: "YOUR_API_KEY" });

async function invokeClaude() {
  const prompt = "Explain quantum computing in one sentence.";
  const input = {
    modelId: "claude-3-sonnet-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "cloud-ai-2026",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }]
    })
  };

  const command = new InvokeModelCommand(input);
  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  console.log(responseBody.content[0].text);
}
invokeClaude();
\`\`\``;
    } else {
      responseText = `I have received your request: "${text}". 

As an AI Assistant using **${model}**, I can coordinate this request against connected resources, query your selected databases, or execute analytical models.

Let me know if you would like me to compile code, perform a semantic search in your knowledge base, or test custom safety guardrail policy limits for this input.`;
      
      if (useKnowledgeBase) {
        sources = [
          {
            title: "Product Documentation",
            url: "https://example.com/knowledge-bases/"
          }
        ];
      }
    }

    // Split text into tokens / words to simulate streaming
    const words = responseText.split(/(\s+)/);
    let index = 0;
    let currentString = "";

    const interval = setInterval(() => {
      if (index < words.length) {
        currentString += words[index];
        onChunk(currentString);
        index++;
      } else {
        clearInterval(interval);
        onDone(currentString, sources);
      }
    }, 15); // Fast streaming simulation
  }
};
