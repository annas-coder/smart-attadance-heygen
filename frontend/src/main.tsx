
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  if (window.location.hostname === "smartkiosk.twintik.com" && !window.location.hash.startsWith("#/kiosk")) {
    window.location.hash = "#/kiosk";
  }

  createRoot(document.getElementById("root")!).render(<App />);
  