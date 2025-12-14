import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar.jsx";
import TokenWatcher from "../backend/lib/TokenWatcher.js";
import { TenantProvider } from "./context/TenantContext.jsx";
import { YearProvider } from "./YearContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <TenantProvider>
        <YearProvider>
          <TokenWatcher />
          <Navbar />
          <App />
          <Toaster />
        </YearProvider>
      </TenantProvider>
    </BrowserRouter>
  </StrictMode>
);
