import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
// Retained adapter, used only when explicitly building for the original platform.
import { grokPwaPlugin } from "./scripts/grok-pwa-plugin.mjs";
// Read-only development environment endpoint.
import { appEnvPlugin } from "./scripts/app-env-plugin.mjs";

const STATIC_PAGES = process.env.STATIC_PAGES === "1";
// Independent storefront builds own their SEO and do not load external platform chrome.
// The original platform adapter remains an explicit, reversible opt-in.
const PLATFORM_CHROME = process.env.GROK_PLATFORM === "1";

export default defineConfig(({ command, isPreview }) => ({
  base: STATIC_PAGES ? "/detox-gr/" : "/",
  server: { host: "0.0.0.0", port: 8080, strictPort: true },
  preview: { host: "127.0.0.1", port: 8081, strictPort: true },
  resolve: { tsconfigPaths: true },
  plugins: [
    appEnvPlugin(),
    ...(PLATFORM_CHROME ? [grokPwaPlugin()] : []),
    tailwindcss(),
    tanstackStart(STATIC_PAGES ? { spa: { enabled: true } } : undefined),
    ...(!STATIC_PAGES && (command === "build" || isPreview)
      ? [nitro({ preset: "vercel", ...(PLATFORM_CHROME ? { serverDir: "./server" } : { serverDir: false }) })]
      : []),
    viteReact(),
  ],
}));
