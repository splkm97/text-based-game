import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";
import { contentEditor } from "./tools/content-editor/vitePlugin.ts";

// The hub reads a world's meta, theme, and cover statically, so those files ship with the host
// chunk. Everything else under a world directory loads only when `import("./world")` runs.
const HUB_STATIC = /\/src\/worlds\/adventurer\/(meta\.ts|theme\.ts|sprites\/portraits\.ts)$/;
const isHost = (id: string): boolean => /\/src\/(host|shared)\//.test(id) || HUB_STATIC.test(id);
const isAdventurer = (id: string): boolean =>
  id.includes("/src/worlds/adventurer/") && !HUB_STATIC.test(id);

export default defineConfig({
  plugins: [
    react(),
    contentEditor(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icon.svg"],
      workbox: { globPatterns: ["**/*.{js,css,html,woff2}"] },
      manifest: {
        name: "TXT GAME BOX",
        short_name: "TXT GAME BOX",
        lang: "ko",
        display: "standalone",
        orientation: "portrait",
        theme_color: "#1D2B53",
        background_color: "#1D2B53",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
    }),
  ],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "vendor", test: /node_modules/ },
            { name: "host", test: isHost },
            { name: "world-adventurer", test: isAdventurer },
          ],
        },
      },
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}", "tools/**/*.test.ts"],
    // Module singletons (stores, screen state) would leak across test files otherwise.
    isolate: true,
  },
});
