import React, { useEffect, useState } from "react";
import "./App.css";
import AppRoutes from "./routes/AppRoutes.js";
import { useInitializeApp } from "./hooks/useInitializeApp.js";
import { TooltipProvider } from "./components/ui/tooltip.js";
import { Toaster } from "./components/ui/toast.js";
import { bootstrapSession } from "./api/axios.js";

function App() {
  useInitializeApp();

  // Restore the signed-in session from the HttpOnly refresh cookie before
  // rendering. Redirects to the website sign-in when there is no session.
  const [sessionReady, setSessionReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    bootstrapSession()
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setSessionReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!sessionReady) {
    return (
      <div
        role="status"
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          color: "#64748b",
        }}
      >
        Restoring your session…
      </div>
    );
  }

  return (
    <>
      <TooltipProvider delay={100}>
        <AppRoutes />
      </TooltipProvider>
      <Toaster />
    </>
  );
}

export default App;
