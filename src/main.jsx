 import React from "react";
 import ReactDOM from "react-dom/client";
 import App from "./App.jsx";
 import { PrivyProvider } from "@privy-io/react-auth";
+import ErrorBoundary from "./ErrorBoundary.jsx";

 // ... dein PRIVY_APP_ID Code bleibt

 ReactDOM.createRoot(document.getElementById("root")).render(
-  <React.StrictMode>
-    <PrivyProvider ...>
-      <App />
-    </PrivyProvider>
-  </React.StrictMode>
+  <ErrorBoundary>
+    <PrivyProvider appId={PRIVY_APP_ID} config={{ loginMethods: ["wallet", "email"], appearance: { theme: "dark" } }}>
+      <App />
+    </PrivyProvider>
+  </ErrorBoundary>
 );
