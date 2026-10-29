// Imported for its startup-validation side effects: fails fast with a clear
// message when required configuration (e.g. AUTH_JWT_SECRET) is missing.
import "./config/env.js";
import { buildApp } from "./app.js";

const app = buildApp();

// Configurable for local development so the website (3001), POS frontend,
// and a second backend instance can run alongside the default port.
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));
