import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";
import { contentEditor } from "./tools/content-editor/vitePlugin.ts";

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
        name: "모험가 이야기",
        short_name: "모험가",
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
            { name: "world-adventurer", test: /\/src\/worlds\/adventurer\// },
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
