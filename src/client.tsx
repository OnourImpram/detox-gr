import { StartClient } from "@tanstack/react-start/client";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";

startTransition(() => {
  hydrateRoot(document, <StrictMode><StartClient /></StrictMode>, {
    onRecoverableError(error, info) {
      // Preserve evidence rather than hiding hydration errors behind a successful render.
      console.error("Hydration recovery", error, info.componentStack);
    },
  });
});
