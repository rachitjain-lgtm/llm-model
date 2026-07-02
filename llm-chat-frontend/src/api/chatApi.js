// Mock API for chat actions with simulated streaming
export const chatApi = {
  sendMessageStream: (chatId, text, model, useKnowledgeBase, onChunk, onDone) => {
    const responseText = `I have received your request: "${text}". 

> **Note:** LLM model backend is not integrated yet. Running in demonstration mode using **${model}**.

As an AI Assistant using **${model}**, I can coordinate this request against connected resources, query your selected databases, or execute analytical models.

Let me know if you would like me to compile code, perform a semantic search in your knowledge base, or test custom safety guardrail policy limits for this input.`;

    let sources = null;
    if (useKnowledgeBase) {
      sources = [
        {
          title: "Product Documentation",
          url: "https://example.com/knowledge-bases/"
        }
      ];
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
