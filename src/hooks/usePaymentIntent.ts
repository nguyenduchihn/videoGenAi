import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createIntent, intentStatus } from "@/api/billing.api";
import { getErrorMessage, toApiError } from "@/lib/errors";
import { qk } from "@/lib/queryClient";
import type { PaymentIntent } from "@/types/api";

type PIState = "idle" | "creating" | "showing" | "paid" | "expired" | "failed" | "cancelled";

export function usePaymentIntent(opts?: { onPaid?: (intent: PaymentIntent) => void }) {
    const [state, setState] = useState<PIState>("idle");
    const [intent, setIntent] = useState<PaymentIntent | null>(null);
    const [remainingMs, setRemainingMs] = useState(0);
    const [pollError, setPollError] = useState<string | null>(null);
    const [pausedUntil, setPausedUntil] = useState<number | null>(null);
    const [pollEpoch, setPollEpoch] = useState(0);

    const intentRef = useRef<PaymentIntent | null>(null);
    const pauseRef = useRef<number | null>(null);
    const errRef = useRef(0);
    const lastPkgRef = useRef("");
    const onPaidRef = useRef(opts?.onPaid);
    const qc = useQueryClient();

    useEffect(() => { onPaidRef.current = opts?.onPaid; });
    useEffect(() => { intentRef.current = intent; }, [intent]);
    useEffect(() => { pauseRef.current = pausedUntil; }, [pausedUntil]);

    const expiresAt = intent?.expiresAt;
    useEffect(() => {
        if (state !== "showing" || !expiresAt) return;
        const deadline = new Date(expiresAt).getTime();
        const t = setInterval(() => {
            const left = Math.max(0, deadline - Date.now());
            setRemainingMs(left);
            if (left === 0) setState("expired");
        }, 1_000);
        return () => clearInterval(t);
    }, [state, expiresAt]);

    useEffect(() => {
        if (state !== "showing") return;
        let dead = false;
        let tid: ReturnType<typeof setTimeout>;

        const schedule = (ms: number) => { if (!dead) tid = setTimeout(doPoll, ms); };

        async function doPoll() {
            if (dead || document.hidden) { schedule(5_000); return; }
            const now = Date.now();
            if (pauseRef.current && now < pauseRef.current) { schedule(pauseRef.current - now + 200); return; }
            const cur = intentRef.current;
            if (!cur || cur.status !== "pending" || cur.expired) return;
            try {
                const updated = await intentStatus(cur.intentId);
                if (dead) return;
                errRef.current = 0;
                setIntent(updated);
                if (updated.status === "paid") {
                    setState("paid");
                    void qc.invalidateQueries({ queryKey: qk.me });
                    onPaidRef.current?.(updated);
                } else if (updated.status === "cancelled") {
                    setState("cancelled");
                } else if (updated.status === "failed") {
                    setState("failed");
                } else if (updated.expired) {
                    setState("expired");
                } else {
                    schedule(5_000);
                }
            } catch (err) {
                if (dead) return;
                const ae = toApiError(err);
                if (ae.status === 429) {
                    const until = Date.now() + 60_000;
                    setPausedUntil(until);
                    pauseRef.current = until;
                    schedule(60_200);
                } else {
                    errRef.current++;
                    if (errRef.current >= 3) setPollError(getErrorMessage(err));
                    else schedule(Math.pow(2, errRef.current) * 2_000);
                }
            }
        }

        schedule(5_000);
        const onVis = () => { if (!document.hidden && !dead) { clearTimeout(tid); void doPoll(); } };
        document.addEventListener("visibilitychange", onVis);
        return () => { dead = true; clearTimeout(tid); document.removeEventListener("visibilitychange", onVis); };
    }, [state, qc, pollEpoch]);

    /** Sau khi poll lỗi 3 lần liên tiếp (pollError): người dùng bấm "Thử lại" ⇒ poll tiếp. */
    const resumePolling = useCallback(() => {
        errRef.current = 0;
        setPollError(null);
        setPollEpoch((n) => n + 1);
    }, []);

    const _startCreate = useCallback(async (packageId: string) => {
        lastPkgRef.current = packageId;
        setState("creating"); setPollError(null); setPausedUntil(null); errRef.current = 0;
        const i = await createIntent(packageId);
        setIntent(i);
        setRemainingMs(Math.max(0, new Date(i.expiresAt).getTime() - Date.now()));
        setState("showing");
    }, []);

    const create = useCallback(async (packageId: string) => {
        if (state === "creating" || state === "showing") return;
        try { await _startCreate(packageId); } catch (err) { setState("idle"); throw err; }
    }, [state, _startCreate]);

    const reset = useCallback(() => {
        setState("idle"); setIntent(null); setRemainingMs(0); setPollError(null);
        setPausedUntil(null); errRef.current = 0;
    }, []);

    const createAnother = useCallback(async (packageId?: string) => {
        const pkg = packageId ?? lastPkgRef.current;
        if (!pkg) return;
        reset();
        try { await _startCreate(pkg); } catch (err) { setState("idle"); throw err; }
    }, [reset, _startCreate]);

    return { state, intent, remainingMs, pollError, pausedUntil, create, reset, createAnother, resumePolling };
}
