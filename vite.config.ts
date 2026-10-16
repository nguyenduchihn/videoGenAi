
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

/** Backend mà dev server chuyển tiếp /portal, /v1 tới: mặc định prod; đặt VITE_PROXY_TARGET=http://127.0.0.1:4100 để thử API local. */
const PROXY_TARGET = process.env.VITE_PROXY_TARGET || "https://api.169-58-141-137.sslip.io";

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
        target: PROXY_TARGET,
        changeOrigin: true,
        secure: true,
      },
      "/v1": {
        target: PROXY_TARGET,
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
