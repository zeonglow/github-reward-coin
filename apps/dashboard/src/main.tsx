import { createRoot } from "react-dom/client";
// @ts-expect-error - NPM imports in Deno not fully supported by TypeScript
import App from "./App.tsx";
import "./index.css";
import React from "react";

createRoot(document.getElementById("root")!).render(<App />);
