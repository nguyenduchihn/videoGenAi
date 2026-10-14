import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { usePaymentIntent } from "./usePaymentIntent";
import type { PaymentIntent } from "@/types/api";

vi.mock("@/api/billing.api", () => ({
    createIntent: vi.fn(),
    intentStatus: vi.fn(),
}));

import * as billingApi from "@/api/billing.api";

const makeIntent = (overrides: Partial<PaymentIntent> = {}): PaymentIntent => ({
    intentId: "int_1",
    code: "VGAI123",
    qrImageUrl: "https://example.com/qr.png",
    isExisting: false,
    status: "pending",
    expired: false,
    package: { id: "p1", label: "Starter", amountVnd: 99_000, credits: 500 },
    bankInfo: { bank: "VCB", bankCode: "VCB", accountNumber: "123", accountName: "Test" },
    failureReason: null,
    cancellationReason: null,
    paidAt: null,
    expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
    createdAt: new Date().toISOString(),
    ...overrides,
});

function wrapper({ children }: { children: ReactNode }) {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => { vi.useFakeTimers({ shouldAdvanceTime: true }); });
afterEach(() => { vi.useRealTimers(); vi.clearAllMocks(); });

describe("usePaymentIntent", () => {
    it("transitions idle → creating → showing on create()", async () => {
        vi.mocked(billingApi.createIntent).mockResolvedValue(makeIntent());
        const { result } = renderHook(() => usePaymentIntent(), { wrapper });
        expect(result.current.state).toBe("idle");
        act(() => { void result.current.create("p1"); });
        await waitFor(() => expect(result.current.state).toBe("showing"));
        expect(result.current.intent?.intentId).toBe("int_1");
    });

    it("transitions showing → paid when poll returns paid", async () => {
        vi.mocked(billingApi.createIntent).mockResolvedValue(makeIntent());
        const paidIntent = makeIntent({ status: "paid", paidAt: new Date().toISOString() });
        vi.mocked(billingApi.intentStatus).mockResolvedValue(paidIntent);
        const onPaid = vi.fn();
        const { result } = renderHook(() => usePaymentIntent({ onPaid }), { wrapper });
        act(() => { void result.current.create("p1"); });
        await waitFor(() => expect(result.current.state).toBe("showing"));
        await act(async () => { await vi.advanceTimersByTimeAsync(5_100); });
        await waitFor(() => expect(result.current.state).toBe("paid"));
        expect(onPaid).toHaveBeenCalledWith(paidIntent);
    });

    it("sets pausedUntil on 429 poll response", async () => {
        vi.mocked(billingApi.createIntent).mockResolvedValue(makeIntent());
        const ae = Object.assign(new Error("rate"), { isAxiosError: true, response: { status: 429, data: {} } });
        vi.mocked(billingApi.intentStatus).mockRejectedValue(ae);
        const { result } = renderHook(() => usePaymentIntent(), { wrapper });
        act(() => { void result.current.create("p1"); });
        await waitFor(() => expect(result.current.state).toBe("showing"));
        await act(async () => { await vi.advanceTimersByTimeAsync(5_100); });
        await waitFor(() => expect(result.current.pausedUntil).not.toBeNull());
    });
});
