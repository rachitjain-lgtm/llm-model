# AI Studio Frontend

## API key setup

1. Copy `.env.example` to `.env.local`.
2. Add your OpenRouter key to `VITE_OPENROUTER_API_KEY`.
3. Keep `VITE_GOOGLE_CLIENT_ID` only if you want Google sign-in enabled.
4. Start the app with `npm run dev`.

Example:

```env
VITE_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
VITE_OPENROUTER_API_KEY="sk-or-v1-..."
VITE_APP_NAME="AI Studio"
VITE_OPENROUTER_API_URL="https://openrouter.ai/api/v1/chat/completions"
```

## Notes

- `.env.local` is ignored by git, so use it for real secrets.
- The frontend can also accept the OpenRouter key from the Settings modal.
- For production, move model requests behind a backend proxy instead of exposing provider keys in the browser.
