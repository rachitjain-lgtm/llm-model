import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { store } from "./store/store";
import App from "./App";
import "./styles/global.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

if (!googleClientId) {
  console.warn("VITE_GOOGLE_CLIENT_ID is not set. Google sign-in will be hidden until it is configured.");
}

const app = googleClientId ? (
  <GoogleOAuthProvider clientId={googleClientId}>
    <App />
  </GoogleOAuthProvider>
) : (
  <App />
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>{app}</Provider>
  </React.StrictMode>
);