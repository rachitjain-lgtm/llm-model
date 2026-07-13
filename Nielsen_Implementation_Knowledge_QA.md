# Nielsen Media Implementation Knowledge Q&A

This sheet is for the kind of strict technical review where someone wants to know whether we truly understand the codebase and the changes we made.

## What the reviewer may ask

### 1. Did you build this yourself or just generate it?
We built the implementation in the repository and wired the pieces together ourselves. AI assistance may have helped with speed, but the final code paths, data flow, and integration logic were implemented and adjusted in the project.

### 2. Do you understand what each major file does?
Yes. We can explain the purpose of each major file and how it connects to the rest of the app.

### 3. Do you understand every single line of code?
We understand the purpose of the code we wrote and can explain it line by line in the areas we modified. For framework boilerplate or third-party library code, the behavior follows standard library patterns.

### 4. What is the core request flow in the app?
The frontend sends the selected provider, model, and prompt to the backend. The backend resolves the provider profile, chooses the correct adapter, calls the selected model host, and returns the result to the frontend.

### 5. Why is there a provider slice in Redux?
Redux stores the provider profiles and the active provider state so the frontend can reuse them across the settings panel, topbar, and right panel without duplicating logic.

### 6. What does the provider manager modal do?
It lets an admin or user register a provider profile from the UI, including provider type, config fields, and the model IDs exposed by that provider.

### 7. Why did you add provider profiles instead of only storing a provider name?
Because a provider is more than a label. It can have its own endpoint, credentials, deployment info, region, guardrail, and model list. A profile lets us store that structure cleanly.

### 8. How does the app make sure AWS Bedrock only shows AWS Bedrock models?
The provider profile determines which model list is shown in the frontend. When AWS Bedrock is selected, the model dropdown is filtered to the Bedrock models for that profile.

### 9. How do you keep secrets out of the browser?
Secrets live in backend-managed configuration or server environment variables. The frontend only sends the selected provider/profile reference and prompt data.

### 10. Why is the backend needed if the frontend already has the model list?
The frontend only controls the UI. The backend performs the secure provider resolution and makes the actual LLM API call.

### 11. How do you know which provider to call in the backend?
`chat.service.js` resolves the active provider profile first, then `llm.service.js` maps that provider to the correct adapter file.

### 12. What did you add for AWS Bedrock specifically?
We added a Bedrock provider profile shape, Bedrock-related config fields, Bedrock model IDs, and backend adapter support for handling Bedrock-style requests.

### 13. What does `App.jsx` do in this flow?
It loads chats and provider profiles after login, applies the theme, and renders the main app panels plus the modals.

### 14. Why did you touch `SettingsModal`, `Topbar`, and `RightPanel`?
Those are the user-facing places where provider choice and model choice need to stay in sync. If the selected provider changes, the model list must change too.

### 15. What is the role of `provider.service.js`?
It stores and serves provider profiles, including built-in defaults and custom profiles saved by the user.

### 16. What is the role of `llm.service.js`?
It acts as the provider dispatcher. It receives the prompt request, resolves the provider, and forwards the call to the matching adapter.

### 17. What is the role of `chat.service.js`?
It ties the conversation state to the selected provider and model, and then routes generation through the LLM service using that context.

### 18. What changed in the auth flow?
We moved the Google client ID to `VITE_GOOGLE_CLIENT_ID` and guarded the Google sign-in UI so the app does not crash when that env var is missing.

### 19. What changed when the app showed the Google OAuth error?
We identified that the issue was not the backend, but the Google OAuth client configuration. The app origin must be allowed in Google Cloud Console.

### 20. What would you say if the reviewer asks for proof that this is not a generic template?
We can point to the provider registry, provider profile management, backend adapter routing, Redux provider state, and provider-based model filtering as custom application logic that was integrated into the codebase.

## Good short answer to use live

We understand the codebase we implemented, especially the provider flow from React to Node.js to AWS Bedrock. We can explain the purpose of the files we changed, the data flow between them, and the reason each piece exists.


## File-by-File Review Questions

### Frontend Core

#### `src/main.jsx`
- Why is `GoogleOAuthProvider` initialized here?
- Why does the app read `VITE_GOOGLE_CLIENT_ID` from the environment?
- What happens when that env value is missing?

#### `src/App.jsx`
- Why do we fetch chats and providers after login?
- Why are the provider modal and settings modal rendered at the app root?
- How does theme state affect the app shell?

#### `src/store/store.js`
- Why are `chat`, `ui`, `auth`, and `providers` separate reducers?
- What belongs in Redux versus local component state?

#### `src/store/authSlice.js`
- Why does auth state store the user and token in localStorage?
- What is the difference between `authStart`, `loginSuccess`, and `authFailure`?
- Why do we clear the session when token state is inconsistent?

#### `src/store/chatSlice.js`
- Why does each chat keep its own provider, model, and settings?
- Why is `createNewChat` setting a default provider and model?
- How do we persist chat selection across refreshes?

#### `src/store/providerSlice.js`
- Why do we keep built-in and custom provider profiles together?
- How are provider CRUD actions connected to the backend?
- Why are provider selectors needed by the UI?

#### `src/store/uiSlice.js`
- What UI state belongs here instead of in components?
- Why do we need separate flags for settings, provider manager, model dropdown, and right panel?

#### `src/api/axiosClient.js`
- What base URL does the frontend use to call the backend?
- How are auth headers attached to requests?

#### `src/api/chatApi.js`
- How does it send the provider and model to the backend?
- Which request creates a chat and which one sends a prompt?

#### `src/api/providerApi.js`
- How do we load provider profiles from the backend?
- How do create, update, and delete operations work?

#### `src/api/generateApi.js`
- What is its role in generating model responses?

#### `src/config/models.js`
- Why do we need built-in provider profiles here?
- How do provider-specific model lists work?
- Why are helper functions needed for labels and defaults?

#### `src/components/Login.jsx`
- Why do we guard Google sign-in with `googleSignInEnabled`?
- Why do we fall back to local login if the backend call fails?
- Why are there separate login, signup, forgot password, and reset views?

#### `src/components/Sidebar.jsx`
- How does the sidebar list and switch conversations?
- Why does it need access to chat state?

#### `src/components/Topbar.jsx`
- How does the topbar model selector follow the active provider?
- Why does the topbar read provider profiles from Redux?

#### `src/components/SettingsModal.jsx`
- Why does the settings modal show both provider and model selectors?
- Why is provider selection tied to model filtering?
- Why include the provider manager entry here?

#### `src/components/RightPanel.jsx`
- Why does run control need provider-aware model selection?
- What happens when the user changes provider from this panel?

#### `src/components/ProviderManagerModal.jsx`
- What information is required to register a provider profile?
- Why are provider config fields dynamic?
- Why are built-in profiles shown alongside custom profiles?

#### `src/components/PromptComposer.jsx`
- How does the prompt composer attach provider, model, and settings to a request?
- Why does it belong to the chat flow rather than global app state?

#### `src/components/ChatWindow.jsx`
- How does it render a conversation history?
- Why does it depend on the active chat from Redux?

#### `src/components/MessageBubble.jsx`
- How does it decide whether to render user or assistant content?
- How are sources, images, or formatted blocks handled?

#### `src/components/PromptLibraryModal.jsx`
- What problem does the prompt library solve for the user?

#### `src/components/FabricEditorModal.jsx`
- What is the purpose of this editor surface?
- Why is it optional relative to the provider workflow?

#### `src/components/MermaidBlock.jsx`
- Why is the diagram renderer separated into its own component?
- What should happen if rendering is unavailable?

#### `src/components/SvgBlock.jsx`
- Why does SVG content get special rendering and export handling?

#### `src/components/ReactFlowBlock.jsx`
- Why is flowchart rendering isolated from the chat logic?
- What is the fallback behavior when the editor cannot render?

#### `src/utils/exportUtils.js`
- How are chats exported to Markdown and JSON?
- Why is export separated from the UI component tree?

#### `src/styles/global.css`
- What app-wide layout or theme rules live here?

#### `src/styles/variables.css`
- What design tokens or CSS variables are centralized here?

### Backend Core

#### `backend/server.js`
- How does the server start and what does it boot first?
- What ports and startup behavior does it define?

#### `backend/app.js`
- Which routes and middleware are mounted here?
- Why is this the place to wire the application together?

#### `backend/config/database.js`
- How does the app connect to MongoDB?
- What happens if the connection fails?

#### `backend/config/logger.js`
- Why do we need centralized logging?

#### `backend/config/redis.js`
- What is Redis used for in this project?

#### `backend/config/openai.js`
- What provider configuration does this file hold?

#### `backend/config/cloudinary.js`
- Why does the app need Cloudinary configuration?

#### `backend/controllers/auth.controller.js`
- How does the controller map request bodies to auth service calls?
- Why does it return structured JSON responses?

#### `backend/controllers/chat.controller.js`
- How does it connect chat routes to chat service logic?

#### `backend/controllers/provider.controller.js`
- How are provider profile requests handled here?

#### `backend/controllers/settings.controller.js`
- Why is settings logic separated from chat logic?

#### `backend/controllers/history.controller.js`
- What conversation history behavior does it expose?

#### `backend/controllers/user.controller.js`
- What user management actions belong here?

#### `backend/controllers/upload.controller.js`
- How does file upload connect to the rest of the app?

#### `backend/routes/auth.routes.js`
- Which auth endpoints are exposed here?
- Why is validation attached at the route level?

#### `backend/routes/chat.routes.js`
- Which chat endpoints are available to the frontend?

#### `backend/routes/provider.routes.js`
- How do provider CRUD routes map to the controller?

#### `backend/routes/settings.routes.js`
- What settings endpoints exist here?

#### `backend/routes/history.routes.js`
- What does the history route group expose?

#### `backend/routes/generate.routes.js`
- Why is generation routed separately from normal chat CRUD?

#### `backend/routes/user.routes.js`
- What user endpoints are made public or protected here?

#### `backend/routes/upload.routes.js`
- Why does upload need its own route group?

#### `backend/routes/health.routes.js`
- Why does the app expose a health check route?

#### `backend/services/auth.service.js`
- How does registration work?
- How does login validate the user?
- How does Google login fit into the auth flow?

#### `backend/services/chat.service.js`
- How does a prompt move from a chat record to an LLM request?
- How is the selected provider resolved for a chat?
- How are provider models used to pick the final model ID?

#### `backend/services/provider.service.js`
- How are built-in provider profiles defined?
- How are custom provider profiles stored in MongoDB?
- Why does the service sanitize profiles before returning them?

#### `backend/services/llm.service.js`
- How does it choose the correct provider adapter?
- Why does it pass provider profile config into the adapter?
- How does it build the system prompt?

#### `backend/services/generate.service.js`
- What is its role compared with `chat.service.js`?

#### `backend/services/history.service.js`
- What history operations belong here?

#### `backend/services/search.service.js`
- Why does the app need search context in addition to model responses?

#### `backend/services/settings.service.js`
- How are app settings loaded and persisted?

#### `backend/services/upload.service.js`
- How does file processing work before the backend returns results?

#### `backend/providers/index.js`
- How is the provider registry used to select an adapter?
- Why does this file matter for multi-provider support?

#### `backend/providers/openrouter.provider.js`
- What request shape does OpenRouter expect?

#### `backend/providers/openai.provider.js`
- How does the OpenAI adapter differ from the OpenRouter adapter?

#### `backend/providers/azure.provider.js`
- What Azure-specific values are needed to call the model?

#### `backend/providers/nvidia.provider.js`
- What makes the NVIDIA provider path distinct?

#### `backend/providers/aws-bedrock.provider.js`
- What AWS Bedrock configuration values are required?
- How does the adapter use the selected Bedrock model ID?

#### `backend/providers/huggingface.provider.js`
- How is the Hugging Face inference endpoint used?

#### `backend/middleware/auth.middleware.js`
- How are protected routes authenticated?

#### `backend/middleware/error.middleware.js`
- Why do we need centralized error handling?

#### `backend/middleware/validate.middleware.js`
- Why are validation errors intercepted before controller logic?

#### `backend/middleware/logger.middleware.js`
- What does request logging capture?

#### `backend/middleware/rateLimit.middleware.js`
- Why does the app need rate limiting?

#### `backend/middleware/role.middleware.js`
- How are role-based permissions enforced?

#### `backend/middleware/upload.middleware.js`
- Why does file upload need middleware?

#### `backend/validators/auth.validator.js`
- What fields are checked before login or registration proceeds?

#### `backend/validators/chat.validator.js`
- What prompt or chat fields are validated here?

#### `backend/validators/provider.validator.js`
- What provider profile fields should be validated here?

#### `backend/validators/settings.validator.js`
- Which settings inputs need validation?

#### `backend/validators/user.validator.js`
- What user fields must be checked before update or creation?

#### `backend/models/User.js`
- What user data is stored in the database model?

#### `backend/models/Chat.js`
- How does the chat model relate to provider and model selection?

#### `backend/models/Conversation.js`
- Why do we have a separate conversation model if chat history exists?

#### `backend/models/Message.js`
- How are messages attached to chats?

#### `backend/models/RefreshToken.js`
- Why are refresh tokens stored separately?

#### `backend/models/Settings.js`
- What app or user preferences are stored here?

#### `backend/utils/jwt.js`
- How are access and refresh tokens generated and verified?

#### `backend/utils/hash.js`
- How are passwords hashed and compared?

#### `backend/utils/helpers.js`
- What common helper behavior belongs here?

#### `backend/utils/constants.js`
- Which shared constants are used across the backend?

#### `backend/utils/pagination.js`
- How is paginated data shaped for list endpoints?

#### `backend/utils/response.js`
- Why is response formatting centralized?

#### `backend/utils/stream.js`
- How does streaming output get chunked or forwarded?

#### `backend/sockets/socket.js`
- What real-time features use sockets in this project?

#### `backend/tests/auth.test.js`
- What auth behavior is covered by tests?

#### `backend/tests/chat.test.js`
- What chat flow is covered by tests?

#### `backend/tests/user.test.js`
- What user behavior is covered by tests?

#### `backend/docs/swagger.json`
- Which APIs are documented for consumers?

#### `backend/prompts/assistant.txt`
- What system behavior does the assistant prompt define?

#### `backend/prompts/coding.txt`
- What coding behavior does this prompt guide?

#### `backend/prompts/research.txt`
- What research behavior does this prompt guide?

#### `backend/test_search_ddg.js`
- What external search behavior is being checked?

#### `backend/test_list_models.js`
- What model listing behavior is being checked?

#### `backend/test_fetch.js`
- What fetch behavior is being checked?

#### `backend/test_bing.js`
- What search integration behavior is being checked?

#### `backend/package.json`
- What scripts and dependencies are required to run the backend?

#### `llm-chat-frontend/package.json`
- What frontend scripts and dependencies are required to run the UI?

### Assets and Non-Core Files

#### `src/assets/*`
- Why are these assets included?
- Which UI surfaces use them?

### Strong Live Answer

We understand the purpose of the files we changed and the flow between them. For framework boilerplate and third-party components, we follow standard behavior, but the project-specific logic was built and integrated by us.

## File-by-File Answers

### Frontend Core

#### `src/main.jsx`
- `GoogleOAuthProvider` is initialized at the app root so every child component can use Google sign-in.
- The app reads `VITE_GOOGLE_CLIENT_ID` from the environment to avoid hardcoding a secret-like value into the bundle.
- When the env value is missing, Google sign-in is disabled so the app still runs without crashing.

#### `src/App.jsx`
- Chats and providers are fetched after login so the UI has the current session data before rendering the main workspace.
- The provider modal and settings modal are rendered at the app root so they can open from anywhere in the UI.
- Theme state toggles the app-wide dark/light class and updates the whole shell.

#### `src/store/store.js`
- `chat`, `ui`, `auth`, and `providers` are separate reducers because they own different slices of application state.
- Global, cross-screen state belongs in Redux; purely local input state stays inside components.

#### `src/store/authSlice.js`
- The user and token are saved in localStorage so login survives refresh.
- `authStart` sets loading, `loginSuccess` stores the authenticated user, and `authFailure` records the error state.
- The session is cleared when stored user/token state is inconsistent to avoid a half-logged-in app.

#### `src/store/chatSlice.js`
- Each chat stores its own provider, model, and settings so conversations can keep their own configuration.
- `createNewChat` initializes a new conversation with a default provider and model so the UI always has a usable starting state.
- Chat selection is persisted through localStorage so refreshes reopen the same conversation.

#### `src/store/providerSlice.js`
- Built-in and custom provider profiles are kept together so the UI can use one list for selection.
- Provider CRUD actions call the backend API and update Redux when the request succeeds.
- Provider selectors let components reuse the same resolved provider list without duplicating lookup logic.

#### `src/store/uiSlice.js`
- UI flags like open modals, dropdowns, and panels belong here because multiple components need to read and change them.
- Separate flags keep settings, provider manager, model dropdown, and right panel from stepping on each other.

#### `src/api/axiosClient.js`
- This file defines the shared backend base URL used by all frontend API calls.
- Auth headers are attached here so the rest of the app can use one consistent request client.

#### `src/api/chatApi.js`
- It sends provider and model values along with the prompt so the backend can route the request correctly.
- One method handles conversation creation and another handles prompt generation or chat messaging.

#### `src/api/providerApi.js`
- It loads provider profiles from the backend provider routes.
- Create, update, and delete simply call the corresponding REST endpoints and return the normalized response.

#### `src/api/generateApi.js`
- It exists to send generation requests through a dedicated path when the app wants to separate generation from normal chat CRUD.

#### `src/config/models.js`
- Built-in provider profiles give the UI a default set of provider/model choices before any custom profile is added.
- Provider-specific model lists drive the dropdown filtering.
- Helper functions are used to resolve labels, defaults, and profile lookups consistently.

#### `src/components/Login.jsx`
- Google sign-in is guarded so the app does not try to initialize OAuth when `VITE_GOOGLE_CLIENT_ID` is missing.
- If the backend Google login fails, the component can still fall back to the local decode path.
- Separate login, signup, forgot password, and reset screens keep the auth experience organized.

#### `src/components/Sidebar.jsx`
- The sidebar lists conversations and switches the active one when the user clicks a thread.
- It needs chat state because conversation selection is part of the main workflow.

#### `src/components/Topbar.jsx`
- The topbar model selector follows the active provider because models are provider-specific.
- It reads provider profiles from Redux so it can show the current provider list and labels.

#### `src/components/SettingsModal.jsx`
- It shows both provider and model selectors because global settings need to reflect the active provider context.
- Provider selection is tied to model filtering so users cannot pick a model that does not belong to the chosen provider.
- The provider manager entry lets the user register new provider profiles from the same settings surface.

#### `src/components/RightPanel.jsx`
- The run controls panel needs provider-aware selection because the actual model call depends on the provider choice.
- When the provider changes, the selected model is recalculated so the chat stays valid.

#### `src/components/ProviderManagerModal.jsx`
- The required information is provider type, profile name, provider config, and the exposed model IDs.
- Provider config fields are dynamic because each provider needs a different set of values.
- Built-in profiles are shown with custom profiles so the user can compare defaults against saved entries.

#### `src/components/PromptComposer.jsx`
- The prompt composer attaches provider, model, and other chat settings to the request before it is sent.
- It belongs to the chat flow because prompt submission is a per-conversation action.

#### `src/components/ChatWindow.jsx`
- It renders the current conversation history and the latest assistant/user messages.
- It depends on the active chat from Redux so it always shows the correct thread.

#### `src/components/MessageBubble.jsx`
- It chooses the bubble style based on whether the sender is the user or the assistant.
- It handles sources, images, or formatted content by branching on the message payload.

#### `src/components/PromptLibraryModal.jsx`
- The prompt library gives the user a reusable prompt workspace instead of typing the same instructions repeatedly.

#### `src/components/FabricEditorModal.jsx`
- This editor surface supports image markup or visual editing workflows.
- It is optional because it is not required for the provider or Bedrock chat flow.

#### `src/components/MermaidBlock.jsx`
- The diagram renderer is separated so structured diagram content can be handled without polluting chat rendering.
- If rendering is unavailable, the fallback should still let the user inspect the source text.

#### `src/components/SvgBlock.jsx`
- SVG content gets special handling so it can be previewed and exported correctly.

#### `src/components/ReactFlowBlock.jsx`
- Flowchart rendering is isolated because it is a specialized visual output, not the core chat pipeline.
- If the editor cannot render, the fallback shows the source JSON or a simple summary.

#### `src/utils/exportUtils.js`
- Chats are exported to Markdown and JSON here so export logic stays out of the UI tree.
- Keeping export separate makes the component code easier to read and test.

#### `src/styles/global.css`
- This file holds app-wide layout and theme rules.

#### `src/styles/variables.css`
- This file centralizes design tokens and reusable CSS variables.

### Backend Core

#### `backend/server.js`
- It starts the HTTP server and boots the application entry point.
- It defines the startup port and the runtime launch behavior.

#### `backend/app.js`
- It mounts middleware and routes for the backend application.
- This is where the whole app is wired together.

#### `backend/config/database.js`
- It connects the app to MongoDB.
- If the connection fails, the backend cannot reliably load or store app data.

#### `backend/config/logger.js`
- It centralizes structured logging for easier debugging and observability.

#### `backend/config/redis.js`
- Redis is used for caching or other fast ephemeral backend state where needed.

#### `backend/config/openai.js`
- It holds OpenAI-related configuration values used by the server.

#### `backend/config/cloudinary.js`
- It stores Cloudinary configuration for media upload or transformation workflows.

#### `backend/controllers/auth.controller.js`
- It maps auth HTTP requests to the auth service and returns structured JSON responses.
- This keeps request handling separate from business logic.

#### `backend/controllers/chat.controller.js`
- It connects chat endpoints to the chat service layer.

#### `backend/controllers/provider.controller.js`
- It handles provider profile requests and forwards them to the provider service.

#### `backend/controllers/settings.controller.js`
- Settings logic is separated because it is app configuration, not chat conversation logic.

#### `backend/controllers/history.controller.js`
- It exposes conversation history behavior to the frontend.

#### `backend/controllers/user.controller.js`
- It handles user creation, retrieval, and update actions.

#### `backend/controllers/upload.controller.js`
- It ties upload requests to file-processing service logic.

#### `backend/routes/auth.routes.js`
- It exposes auth endpoints like login, register, Google login, refresh, logout, and me.
- Validation is attached here so bad requests fail before the controller runs.

#### `backend/routes/chat.routes.js`
- It exposes the endpoints needed for chat creation, updates, and prompt flow.

#### `backend/routes/provider.routes.js`
- It maps provider CRUD endpoints to the provider controller.

#### `backend/routes/settings.routes.js`
- It exposes settings endpoints for reading or updating app configuration.

#### `backend/routes/history.routes.js`
- It exposes history-related endpoints for retrieving past conversation data.

#### `backend/routes/generate.routes.js`
- Generation is routed separately so model calls are isolated from normal chat CRUD behavior.

#### `backend/routes/user.routes.js`
- It exposes user-related endpoints, some public and some protected.

#### `backend/routes/upload.routes.js`
- Upload needs its own route group because file handling has different middleware and error handling.

#### `backend/routes/health.routes.js`
- The health check route exists so uptime or deployment checks can confirm the server is alive.

#### `backend/services/auth.service.js`
- Registration creates the user and tokens.
- Login validates the password and returns the authenticated user payload.
- Google login verifies the Google credential and either creates or links the account.

#### `backend/services/chat.service.js`
- A prompt moves from chat state to LLM request by loading the chat, resolving provider/profile, and calling `llm.service.js`.
- The selected provider is resolved from the chat or request payload.
- Provider models are used to choose a valid model ID for the request.

#### `backend/services/provider.service.js`
- Built-in provider profiles are defined as defaults for supported providers.
- Custom profiles are stored in MongoDB in the `provider_profiles` collection.
- Profiles are sanitized before returning so the frontend gets a clean shape.

#### `backend/services/llm.service.js`
- It chooses the correct provider adapter from the provider registry.
- Provider profile config is passed into the adapter so provider-specific settings are available.
- The system prompt is built from chat context, persona, provider profile, and search context.

#### `backend/services/generate.service.js`
- It provides generation-specific orchestration, separate from the broader chat service responsibilities.

#### `backend/services/history.service.js`
- It groups history-related operations so they do not get mixed into chat mutation logic.

#### `backend/services/search.service.js`
- Search context is needed so the assistant can use live or retrieved information instead of only static model output.

#### `backend/services/settings.service.js`
- It loads and persists app settings for the backend-managed configuration layer.

#### `backend/services/upload.service.js`
- It processes file uploads before returning the result to the app.

#### `backend/providers/index.js`
- The provider registry selects the adapter for the current provider name.
- It matters because it is the central switch that makes multi-provider support possible.

#### `backend/providers/openrouter.provider.js`
- OpenRouter expects its own request body shape and endpoint format.

#### `backend/providers/openai.provider.js`
- The OpenAI adapter uses OpenAI-specific request and endpoint conventions.

#### `backend/providers/azure.provider.js`
- Azure needs endpoint, deployment, and API version details to call the model.

#### `backend/providers/nvidia.provider.js`
- NVIDIA uses its own API endpoint and model naming scheme.

#### `backend/providers/aws-bedrock.provider.js`
- AWS Bedrock requires region, access key, secret key, and model ID config.
- The adapter uses the selected Bedrock model ID to target the right hosted model.

#### `backend/providers/huggingface.provider.js`
- The Hugging Face adapter calls the inference endpoint for the selected model.

#### `backend/middleware/auth.middleware.js`
- Protected routes are authenticated here using token checks.

#### `backend/middleware/error.middleware.js`
- Centralized error handling keeps the server responses consistent.

#### `backend/middleware/validate.middleware.js`
- Validation errors are intercepted here so controllers only run with valid inputs.

#### `backend/middleware/logger.middleware.js`
- Request logging captures incoming requests and helps with debugging.

#### `backend/middleware/rateLimit.middleware.js`
- Rate limiting protects the API from abuse and runaway request spikes.

#### `backend/middleware/role.middleware.js`
- Role-based permissions are enforced here for admin or restricted operations.

#### `backend/middleware/upload.middleware.js`
- File upload needs middleware to parse and validate multipart form data.

#### `backend/validators/auth.validator.js`
- It checks login and registration inputs before the auth service receives them.

#### `backend/validators/chat.validator.js`
- It validates prompt and chat request fields before processing.

#### `backend/validators/provider.validator.js`
- It should validate provider profile fields like type, config, and model IDs.

#### `backend/validators/settings.validator.js`
- It validates app or user settings before persistence.

#### `backend/validators/user.validator.js`
- It validates user fields before creation or update.

#### `backend/models/User.js`
- It stores user identity, email, role, and related account data.

#### `backend/models/Chat.js`
- It stores chat metadata, including provider and model selection.

#### `backend/models/Conversation.js`
- It exists for conversation-oriented data structures distinct from chat metadata.

#### `backend/models/Message.js`
- It stores individual messages linked to a chat.

#### `backend/models/RefreshToken.js`
- Refresh tokens are stored separately so sessions can be renewed securely.

#### `backend/models/Settings.js`
- It stores application or user preference data.

#### `backend/utils/jwt.js`
- It generates and verifies access and refresh tokens.

#### `backend/utils/hash.js`
- It hashes passwords and compares stored credentials safely.

#### `backend/utils/helpers.js`
- Shared helper behavior lives here to avoid repeating utility code across services.

#### `backend/utils/constants.js`
- Shared constants used across the app are centralized here.

#### `backend/utils/pagination.js`
- It shapes paginated responses so list endpoints stay consistent.

#### `backend/utils/response.js`
- It standardizes API response formatting.

#### `backend/utils/stream.js`
- It helps stream model output chunk by chunk.

#### `backend/sockets/socket.js`
- Socket logic supports any real-time interactions the app needs.

#### `backend/tests/auth.test.js`
- It covers auth behavior like login and registration.

#### `backend/tests/chat.test.js`
- It covers chat-related service or endpoint behavior.

#### `backend/tests/user.test.js`
- It covers user-related backend behavior.

#### `backend/docs/swagger.json`
- It documents the API surface for consumers and reviewers.

#### `backend/prompts/assistant.txt`
- It defines assistant behavior and response style.

#### `backend/prompts/coding.txt`
- It defines coding-assistant behavior.

#### `backend/prompts/research.txt`
- It defines research-oriented assistant behavior.

#### `backend/test_search_ddg.js`
- It checks external search functionality.

#### `backend/test_list_models.js`
- It checks model listing or discovery behavior.

#### `backend/test_fetch.js`
- It checks fetch behavior or HTTP connectivity.

#### `backend/test_bing.js`
- It checks search integration behavior for Bing or related providers.

#### `backend/package.json`
- It defines backend scripts and dependencies.

#### `llm-chat-frontend/package.json`
- It defines frontend scripts and dependencies.

### Assets and Non-Core Files

#### `src/assets/*`
- These assets support UI surfaces like logos, icons, and imagery.

### Strong Live Answer

We understand the purpose of the files we changed and the flow between them. For framework boilerplate and third-party components, we follow standard behavior, but the project-specific logic was built and integrated by us.
