import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { PrivyProvider } from "@privy-io/react-auth";
import ErrorBoundary from "./ErrorBoundary.jsx";

const PRIVY_APP_ID = (import.meta.env.VITE_PRIVY_APP_ID ?? "").trim();
if (!PRIVY_APP_ID) {
  throw new Error("Missing VITE_PRIVY_APP_ID in your environment.");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <PrivyProvider
  appId={PRIVY_APP_ID}
  config={{
    loginMethods: ["google"],   // stabil & schnell
    embeddedWallets: {
      createOnLogin: "users-without-wallets",
    },
    appearance: { theme: "dark" },
  }}
>
  <App />
</PrivyProvider>

  </ErrorBoundary>
);
