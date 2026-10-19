
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { renderLlmsTxt, renderMarkdown } from "./src/features/api-docs/content/markdown.ts";

/** /api-docs.md + /llms.txt sinh từ CÙNG manifest với trang /api-docs (dev: phục vụ trực tiếp; build: ghi vào dist). */
function apiDocsMarkdown(): Plugin {
  const files = (): Record<string, { body: string; type: string }> => ({
    "api-docs.md": { body: renderMarkdown(), type: "text/markdown; charset=utf-8" },
    "llms.txt": { body: renderLlmsTxt(), type: "text/plain; charset=utf-8" },
  });
  return {
    name: "api-docs-markdown",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const file = files()[(req.url ?? "").split("?")[0]!.slice(1)];
        if (!file) return next();
        res.setHeader("content-type", file.type);
        res.end(file.body);
      });
    },
    generateBundle() {
      for (const [fileName, file] of Object.entries(files())) this.emitFile({ type: "asset", fileName, source: file.body });
    },
  };
}

/** Backend mà dev server chuyển tiếp /portal, /v1 tới: mặc định prod; đặt VITE_PROXY_TARGET=http://127.0.0.1:4100 để thử API local. */
const PROXY_TARGET = process.env.VITE_PROXY_TARGET || "https://aiveo3.org";

export default defineConfig({
  plugins: [react(), tailwindcss(), apiDocsMarkdown()],
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
