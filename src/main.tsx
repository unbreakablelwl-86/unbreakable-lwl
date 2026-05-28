import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initErrorTracking } from "./lib/errorTracking";

// Install global error tracking before anything else
initErrorTracking();

// Register service worker for PWA install
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
