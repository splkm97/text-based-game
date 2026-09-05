import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
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
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
