import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { PrivyProvider } from "@privy-io/react-auth";

const PRIVY_APP_ID = (import.meta.env.VITE_PRIVY_APP_ID ?? "").trim();

if (!PRIVY_APP_ID) {
  throw new Error("Missing VITE_PRIVY_APP_ID in your environment.");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        // optional defaults – kannst du später anpassen
        loginMethods: ["wallet", "email"],
        appearance: { theme: "dark" },
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>
);
