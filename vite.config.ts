
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
  // B1: API phục vụ SPA này từ origin của nó (apps/api/src/bootstrap.ts) ⇒ build ra dist/videogenai ở gốc monorepo.
  build: {
    outDir: "../../dist/videogenai",
    emptyOutDir: true,
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
