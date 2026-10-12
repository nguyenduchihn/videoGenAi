
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/portal": {
        target: "https://api.169-58-141-137.sslip.io",
        changeOrigin: true,
        secure: true,
      },
      "/v1": {
        target: "https://api.169-58-141-137.sslip.io",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
