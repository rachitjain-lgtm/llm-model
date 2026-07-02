import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { store } from "./store/store";
import App from "./App";
import "./styles/global.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "564146584485-bpqen88ijrnqvksc31ob4d6faodfmi50.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </React.StrictMode>
);
