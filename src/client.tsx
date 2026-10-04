import { StartClient } from "@tanstack/react-start/client";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

hydrateRoot(document, <StrictMode><StartClient /></StrictMode>, {
  onRecoverableError(error, info) {
    // Preserve evidence rather than hiding hydration errors behind a successful render.
    console.error("Hydration recovery", error, info.componentStack);
  },
});
