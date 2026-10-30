import React, { useEffect, useState } from "react";
import "./App.css";
import AppRoutes from "./routes/AppRoutes.js";
import { useInitializeApp } from "./hooks/useInitializeApp.js";
import { TooltipProvider } from "./components/ui/tooltip.js";
import { Toaster } from "./components/ui/toast.js";
import { bootstrapSession } from "./api/axios.js";

function App() {
  const [sessionState, setSessionState] = useState<
    "loading" | "ready" | "failed"
  >("loading");

  // Restore the signed-in session from the HttpOnly refresh cookie before
  // rendering. On failure the bootstrap redirects to the website sign-in and
  // the app must NOT mount (otherwise every store call fires without a
  // token and re-triggers redirects).
  useEffect(() => {
    let cancelled = false;
    bootstrapSession()
      .then(() => {
        if (!cancelled) setSessionState("ready");
      })
      .catch(() => {
        if (!cancelled) setSessionState("failed");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Startup data fetches wait until the session bootstrap has restored the
  // token and the active business.
  useInitializeApp(sessionState === "ready");

  if (sessionState !== "ready") {
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
        {sessionState === "loading"
          ? "Restoring your session…"
          : "Session could not be restored — redirecting to sign-in…"}
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
