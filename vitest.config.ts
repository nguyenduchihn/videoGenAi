import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [react()],
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    test: {
        globals: true,
        environment: "jsdom",
        include: ["src/**/*.{test,spec}.{ts,tsx}"],
        setupFiles: ["src/test/setup.ts"],
        coverage: {
            provider: "v8",
            include: ["src/**/*.{ts,tsx}"],
            exclude: ["src/api/schema.d.ts", "src/main.tsx", "src/mocks/**", "src/test/**"],
        },
    },
});
