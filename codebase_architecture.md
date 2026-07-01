# AI Studio Codebase Documentation

This document provides a comprehensive overview of the libraries, components, Redux slices, API objects, and utilities used in the **AI Studio** frontend client.

---

## 1. Libraries & Frameworks

The client application is built with the following core packages:

| Library | Version | Functionality & Usage |
| :--- | :--- | :--- |
| **React** | `^19.2.7` | Standard library used for UI rendering. Extensively relies on hooks: `useState` (component state), `useEffect` (side effects like DOM classes, timers, and scrolling), `useRef` (DOM node bindings for auto-scrolling), and `useCallback` (callback memoization). |
| **Redux Toolkit** | `^2.12.0` | Global state container. We use `configureStore` to register slices and `createSlice` to manage actions and reducer states cleanly. |
| **React-Redux** | `^9.3.0` | React bindings for Redux. Uses `useSelector` to retrieve UI and Chat state segments and `useDispatch` to invoke action triggers. |
| **Axios** | `^1.18.1` | HTTP client used to configure connections to external model orchestration gateways. |
| **Lucide React** | `^1.22.0` | Provides fully customizable, SVG-based icon components (`Sun`, `Moon`, `Settings`, `Sparkles`, `X`, `Send`, etc.). |
| **Tailwind CSS** | `^4.3.2` | CSS framework for responsive layout structure and theme variables. |
| **Vite** | `^8.1.1` | Project bundling platform, developer server, and build compiler. |

---

## 2. Redux State Management

The application state is partitioned into two distinct Redux slices:

### A. [uiSlice.js](file:///c:/Users/sande/OneDrive/Desktop/llm-chat/llm-chat-frontend/src/store/uiSlice.js)
Manages theme settings, dropdown visibility toggles, sidebar states, and modal visibility values.

* **State Object Properties**:
  * `sidebarOpen` (bool): Sidebar open drawer status on mobile.
  * `rightPanelOpen` (bool): Right configuration drawer open state.
  * `modelDropdownOpen` (bool): Top navigation model selection menu trigger.
  * `regionDropdownOpen` (bool): Top navigation region selection menu trigger.
  * `kbDropdownOpen` (bool): Chat input composer Knowledge Base dropdown toggle.
  * `activeKbId` (string): Active selected Knowledge Base source ID (e.g., product documentation).
  * `theme` (string): Current application theme (loaded from `localStorage` - defaults to `"light"`).
  * `settingsModalOpen` (bool): Controls display of the Global Settings overlay.
* **Reducer Actions**:
  * `toggleSidebar()` / `setSidebarOpen(payload)`: Toggles or overrides left sidebar visibility.
  * `toggleRightPanel()` / `setRightPanelOpen(payload)`: Toggles or overrides right settings control visibility.
  * `toggleTheme()` / `setTheme(payload)`: Sets theme preference and syncs it with `localStorage`.
  * `toggleSettingsModal()` / `setSettingsModalOpen(payload)`: Opens or closes the global settings card.

### B. [chatSlice.js](file:///c:/Users/sande/OneDrive/Desktop/llm-chat/llm-chat-frontend/src/store/chatSlice.js)
Coordinates chat conversations, active messages list, and active LLM configuration settings.

* **State Object Properties**:
  * `conversations` (array): Array of active chat items containing individual details (`id`, `title`, `model`, `provider`, `region`, `maxTokens`, `useKnowledgeBase`, `useGuardrails`, and `messages` list).
  * `activeConversationId` (string): Holds the active conversation UUID string.
  * `searchQuery` (string): Filters conversation list in sidebar.
  * `streamingOn` (bool): Globally toggles response token streaming speed effects.
  * `isLoading` (bool): Renders loader animation when requesting assistant text outputs.
* **Reducer Actions**:
  * `setActiveConversation(id)`: Loads conversation messages into main screen container.
  * `createNewChat()`: Instantiates new conversation with generic defaults and adds it to state array.
  * `deleteChat(id)`: Removes specified conversation from history array.
  * `renameChat({ id, title })`: Replaces title string for loaded conversation card.
  * `addMessageToActive(message)`: Appends user query or assistant output to message array.
  * `updateActiveLastMessageText(text)`: Typo-updates live streaming chunks.
  * `updateChatSettings({ id, key, value })`: Dynamically changes single parameters (model name, guardrail active switch, token counters, etc.).
  * `setLoadingState(bool)` / `toggleStreaming()`: Controls loading states.

---

## 3. UI Component Hierarchy

All visual layers are styled using standard Tailwind selectors and CSS variables supporting dark mode:

### 1. [App.jsx](file:///c:/Users/sande/OneDrive/Desktop/llm-chat/llm-chat-frontend/src/App.jsx)
The container root wrapper.
* **Functionality**: Imports all main components, tracks `theme` updates via Redux selector, appends/removes class `.dark` to the document root element, and handles the responsive grid layout wrapper.

### 2. [Sidebar.jsx](file:///c:/Users/sande/OneDrive/Desktop/llm-chat/llm-chat-frontend/src/components/Sidebar.jsx)
Left-side drawer menu.
* **Functionality**: Displays the platform logo header (**AI Studio**), triggers new conversation creations, queries/filters active chats using search keywords, handles rename and delete functions, shows corporate workspace information cards, and displays a link button to open the global Settings overlay.

### 3. [Topbar.jsx](file:///c:/Users/sande/OneDrive/Desktop/llm-chat/llm-chat-frontend/src/components/Topbar.jsx)
Top navigation toolbar.
* **Functionality**: Features responsive model name and AWS Region selection dropdown overlays, streaming toggles, sidebar triggers, and settings drawer toggle switches.

### 4. [ChatWindow.jsx](file:///c:/Users/sande/OneDrive/Desktop/llm-chat/llm-chat-frontend/src/components/ChatWindow.jsx)
Central conversation scroll viewport.
* **Functionality**: Renders initial onboarding quick cards (RAG overview, SQL generator, feature comparison) when message index is empty. Uses React `useRef` to trigger `scrollIntoView` updates whenever messages stream.

### 5. [MessageBubble.jsx](file:///c:/Users/sande/OneDrive/Desktop/llm-chat/llm-chat-frontend/src/components/MessageBubble.jsx)
Individual message block parser.
* **Functionality**: Segregates styling layout for User (aligned right) and Assistant messages (aligned left). Parses code formatting blocks (`markdown` code blocks), formats numbered lists, and appends interactive citation links (Knowledge Base source URLs).

### 6. [PromptComposer.jsx](file:///c:/Users/sande/OneDrive/Desktop/llm-chat/llm-chat-frontend/src/components/PromptComposer.jsx)
Bottom text prompt text field container.
* **Functionality**: Automatically resizes text area height while typing. Displays quick toggle parameters (Knowledge Base and Guardrail overrides), handles local file mock attachment additions, and triggers streaming calls when send actions execute.

### 7. [RightPanel.jsx](file:///c:/Users/sande/OneDrive/Desktop/llm-chat/llm-chat-frontend/src/components/RightPanel.jsx)
Right settings slide-out panel.
* **Functionality**: Configures active chat model parameters: Max tokens number limits, active model endpoint selection, default provider text indicator (**Cloud AI**), region choice inputs, and safety guardrail toggle parameters.

### 8. [SettingsModal.jsx](file:///c:/Users/sande/OneDrive/Desktop/llm-chat/llm-chat-frontend/src/components/SettingsModal.jsx)
Global floating dashboard dialog overlay.
* **Functionality**: Renders centered settings menu containing interface Theme toggles (**Light Mode** vs **Dark Mode** selectors) and displays active infrastructure status (Cloud AI Base Provider and animated active Security Gateway status indicators).

---

## 4. API & Communications

* **[axiosClient.js](file:///c:/Users/sande/OneDrive/Desktop/llm-chat/llm-chat-frontend/src/api/axiosClient.js)**:
  * Instantiates default connection properties using a base `https://api.cloud-ai.com/v1` address, prepared for future REST integration.
* **[chatApi.js](file:///c:/Users/sande/OneDrive/Desktop/llm-chat/llm-chat-frontend/src/api/chatApi.js)**:
  * Contains `sendMessageStream` which mocks API streaming actions. Simulates incremental typewriter chunk responses using a custom `setInterval` loop. Emits detailed, context-specific markdown guides based on search keywords (e.g., custom comparing statements for models, RAG database definitions, SQL code blocks) and attaches sources when the Knowledge Base setting is active.
