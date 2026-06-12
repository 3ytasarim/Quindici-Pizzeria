import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.addEventListener("contextmenu", (e) => {
  let el = e.target as HTMLElement | null;
  while (el) {
    if (el.tagName === "IMG") { e.preventDefault(); return; }
    el = el.parentElement;
  }
});

document.addEventListener("dragstart", (e) => {
  if ((e.target as HTMLElement).tagName === "IMG") e.preventDefault();
});

createRoot(document.getElementById("root")!).render(<App />);
