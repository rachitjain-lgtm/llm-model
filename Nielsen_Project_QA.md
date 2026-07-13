# Nielsen Media Project Q&A

This is a prep sheet of questions a technical head or stakeholder may ask while reviewing our AWS Bedrock + React + Node.js integration project.

## Project Summary

- Frontend: React
- Backend: Node.js / Express
- Model hosting: AWS Bedrock
- Goal: Let users access prebuilt LLM models through our application interface, with provider-aware model selection and chat-based usage

## Questions and Answers

### 1. What problem does this project solve?
It gives users a single application interface to access LLMs hosted on AWS Bedrock without needing to work directly with AWS tooling or separate model APIs.

### 2. Why did we choose AWS Bedrock?
AWS Bedrock is a managed way to access foundation models, so it fits a production environment where the company wants centralized control, enterprise-oriented infrastructure, and model access without self-hosting everything.

### 3. How does the React frontend talk to the backend?
The React app sends the selected provider, model, and prompt to the Node.js backend through an API request. The backend then handles the model call and returns the response.

### 4. Why not call AWS Bedrock directly from the frontend?
We keep AWS credentials and model access logic on the server side for security. The frontend should never hold provider secrets or AWS keys.

### 5. What role does the Node.js backend play?
The backend is the routing and orchestration layer. It receives the user request, resolves the selected provider, picks the correct model, calls the AWS Bedrock adapter, and returns the result.

### 6. How do we make sure the user only sees models from the selected provider?
The frontend reads provider profiles and filters the model list based on the active provider. If AWS Bedrock is selected, only Bedrock models are shown.

### 7. Can a user switch providers inside a chat?
Yes. The selected provider is stored with the chat, so the active conversation can use the provider the user chose.

### 8. Where is the provider configuration stored?
Built-in provider settings live in the backend and frontend defaults, while custom provider profiles can be saved through the provider manager flow.

### 9. How do we handle AWS Bedrock credentials?
AWS Region, Access Key ID, Secret Access Key, Model ID, Knowledge Base ID, and Guardrail ID are part of the Bedrock provider configuration, and the backend uses that config when making the model request.

### 10. How do we protect secrets?
Secrets stay in backend-managed config or server environment variables. They are never stored in browser code or exposed in the UI.

### 11. What makes this a real custom build and not a template?
The project includes provider-specific routing, provider profile management, backend model dispatching, and frontend model filtering tied to provider selection. Those pieces are integrated into the app flow rather than being a generic static chat UI.

### 12. How do you know the backend is actually using the selected provider?
The chat service resolves the provider profile first, passes it to the LLM service, and the LLM service selects the matching provider adapter before making the request.

### 13. What happens if the user selects AWS Bedrock but the model does not belong to Bedrock?
The UI should only expose Bedrock-compatible models when AWS Bedrock is selected. On the backend, the resolved provider profile should drive the final model choice.

### 14. Can we add more providers later?
Yes. The provider system was designed to support additional provider adapters and provider profiles without rewriting the whole app.

### 15. What is the difference between a provider and a model?
A provider is the hosting or API layer, such as AWS Bedrock or OpenAI. A model is the specific LLM exposed by that provider, such as Claude or Llama.

### 16. How is the project different from just using OpenRouter?
OpenRouter is one provider path. This project adds provider-aware architecture so the same interface can work with AWS Bedrock and other model hosts, not only OpenRouter.

### 17. How do you ensure this was built in-house?
The architecture includes custom provider profile handling, provider-based model filtering, backend routing, and direct integration logic tailored to this application. It is not a stock SDK wrapper.

### 18. What happens if AWS Bedrock is unavailable?
The backend should return an error state, and the frontend can show a clean failure message without exposing internal secrets or raw AWS details.

### 19. Do users need to know AWS details to use the app?
No. The application can present a simplified UI. AWS configuration can be handled by an admin or through provider setup flows.

### 20. What should the stakeholder expect to see in a demo?
They should see a provider selector, a model dropdown that changes based on the selected provider, a chat prompt being sent, and a response returning from the provider through the backend.

## Short Closing Line

This project is built so the company can access prebuilt AWS Bedrock models through a secure React and Node.js application, with provider-aware model selection and backend-managed credentials.
