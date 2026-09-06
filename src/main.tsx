import type { ReactNode } from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HostApp } from "./host/HostApp";
import "./styles/theme.css";
import "./styles/global.css";

const root = document.getElementById("root");
if (root === null) {
  throw new Error("Missing #root element");
}

const mount = (page: ReactNode): void => {
  createRoot(root).render(<StrictMode>{page}</StrictMode>);
};

// The editor import sits inside the DEV branch so the production build drops it entirely.
if (import.meta.env.DEV && window.location.pathname === "/__content") {
  import("./editor/EditorApp").then(({ EditorApp }) => mount(<EditorApp />));
} else {
  mount(<HostApp />);
}
