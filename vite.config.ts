import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
// Read-only development environment endpoint.
import { appEnvPlugin } from "./scripts/app-env-plugin.mjs";

const STATIC_PAGES = process.env.STATIC_PAGES === "1";
// v3 always uses its own identity, manifest and server routes.

export default defineConfig(({ command, isPreview }) => ({
  base: STATIC_PAGES ? "/detox-gr/" : "/",
  server: { host: "0.0.0.0", port: 8080, strictPort: true },
  preview: { host: "127.0.0.1", port: 8081, strictPort: true },
  resolve: { tsconfigPaths: true },
  plugins: [
    appEnvPlugin(),
    tailwindcss(),
    tanstackStart(STATIC_PAGES ? { spa: { enabled: true } } : undefined),
    ...(!STATIC_PAGES && (command === "build" || isPreview)
      ? [nitro({ preset: "vercel", serverDir: false })]
      : []),
    viteReact(),
  ],
}));
