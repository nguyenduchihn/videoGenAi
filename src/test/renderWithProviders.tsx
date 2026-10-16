import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

/** Render component cần TanStack Query + Router (API giả MSW đã bật trong setup). */
export function renderWithProviders(ui: ReactElement, options: { route?: string } & Omit<RenderOptions, "wrapper"> = {}) {
    const { route = "/", ...rest } = options;
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
    const Wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </QueryClientProvider>
    );
    return { client, ...render(ui, { wrapper: Wrapper, ...rest }) };
}
