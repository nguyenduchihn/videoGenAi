import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": fileURLToPath(
        new URL("./src", import.meta.url)
      ),
    },
  },

  server: {
    proxy: {

      "/portal": {
        target: "http://192.168.2.155:4000",
        changeOrigin: true,
        secure: false,
      },

      "/v1": {
        target: "http://192.168.2.155:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});