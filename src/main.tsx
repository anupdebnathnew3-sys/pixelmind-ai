import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

// Apply persisted theme before React renders to avoid flash
try {
  const stored = localStorage.getItem('pixelmind-storage');
  if (stored) {
    const parsed = JSON.parse(stored);
    const theme = parsed?.state?.theme;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
} catch (_) {}

// Enable smooth theme transitions after initial paint
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.documentElement.classList.add('theme-ready');
  });
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
