import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { SubdomainProvider } from "./contexts/SubdomainContext";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

// Log the hostname on startup
console.log('[main] Starting application with hostname:', window.location.hostname);

const basename = import.meta.env.BASE_URL;

// Force a hard reload if we're on coach1.localhost and there's no reload flag
if (window.location.hostname === 'coach1.localhost' && !sessionStorage.getItem('initial_load')) {
  console.log('[main] First load on coach1.localhost, setting flag');
  sessionStorage.setItem('initial_load', 'true');
  
  // Add a small delay before reloading to ensure the console logs are visible
  setTimeout(() => {
    console.log('[main] Forcing initial reload for coach1.localhost');
    window.location.reload();
  }, 500);
} else {
  // Render the app
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <BrowserRouter basename={basename}>
        <SubdomainProvider>
          <App />
        </SubdomainProvider>
      </BrowserRouter>
    </React.StrictMode>,
  );
}
