import React, { useEffect, useState } from "react";
import "./App.css";
import AppRoutes from "./routes/AppRoutes.js";
import { useInitializeApp } from "./hooks/useInitializeApp.js";
import { TooltipProvider } from "./components/ui/tooltip.js";
import { Toaster } from "./components/ui/toast.js";
function App() {
  useInitializeApp();
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
