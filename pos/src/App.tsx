import React, { useEffect, useState } from "react";
import "./App.css";
import AppRoutes from "./routes/AppRoutes.js";
import { useInitializeApp } from "./hooks/useInitializeApp.js";
function App() {
  useInitializeApp();
  return <AppRoutes />;
}

export default App;
