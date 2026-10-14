import { useState } from "react";
import { Link } from "react-router-dom";
import { useApiKeyStore } from "@/stores/apiKey.store";
import { useAuthStore } from "@/stores/auth.store";
import { useFeedbackStore } from "@/stores/feedback.store";
import { createApiKey } from "@/api/portal.api";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { Modal, Button, Input } from "@/components/ui";
import type { StoredApiKey } from "@/types/api";

function shortUA(): string {
    const ua = navigator.userAgent;
    const b = /Chrome/.test(ua) ? "Chrome" : /Firefox/.test(ua) ? "Firefox" : /Safari/.test(ua) ? "Safari" : "Trình duyệt";
    const o = /Mac/.test(ua) ? "macOS" : /Win/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : "";
    return o ? `${b} · ${o}` : b;
}

export function ConnectKeyDialog() {
    const open = useApiKeyStore((s) => s.connectOpen);
    const setKey = useApiKeyStore((s) => s.setKey);
    const close = useApiKeyStore((s) => s.closeConnectDialog);
    const pushToast = useFeedbackStore((s) => s.pushToast);
    const [creating, setCreating] = useState(false);
    const [createErr, setCreateErr] = useState("");
    const [pasteVal, setPasteVal] = useState("");
    const [checking, setChecking] = useState(false);
    const [pasteErr, setPasteErr] = useState("");

    const handleCreate = async () => {
        setCreating(true);
        setCreateErr("");
        try {
            const r = await createApiKey(`Portal web · ${shortUA()}`);
            setKey({ raw: r.raw, keyId: r.id, last4: r.last4 } as StoredApiKey);
            pushToast({ variant: "success", message: "Đã kết nối API key" });
        } catch (e) {
            setCreateErr(getErrorMessage(e));
        } finally {
            setCreating(false);
        }
    };

    const handlePaste = async () => {
        const raw = pasteVal.trim();
        if (!raw) { setPasteErr("Vui lòng nhập API key."); return; }
        setChecking(true);
        setPasteErr("");
        try {
            await api.get("/v1/me", { headers: { "X-API-Key": raw }, withCredentials: false });
            const last4 = raw.slice(-4);
            const matches = (useAuthStore.getState().user?.keys ?? []).filter((k) => !k.revokedAt && k.last4 === last4);
            setKey({ raw, last4, keyId: matches.length === 1 ? matches[0]!.id : undefined } as StoredApiKey);
            pushToast({ variant: "success", message: "Đã kết nối API key" });
        } catch (e) {
            setPasteErr(getErrorMessage(e));
        } finally {
            setChecking(false);
        }
    };

    return (
        <Modal open={open} onClose={close} title="Kết nối API key" size="md">
            <p className="mb-4 text-sm text-[var(--app-text-secondary)]">
                Trình duyệt này chưa có API key để tạo video. Chọn một cách:
            </p>
            <div className="space-y-3">
                <div className="rounded-xl border border-[var(--app-border)] p-4">
                    <p className="mb-2 text-sm font-medium text-[var(--app-text)]">
                        Tạo key mới cho trình duyệt này
                    </p>
                    {createErr && (
                        <p className="mb-2 text-xs text-[var(--app-danger)]">{createErr}</p>
                    )}
                    <Button variant="primary" size="sm" loading={creating} onClick={handleCreate} fullWidth>
                        Tạo key mới
                    </Button>
                </div>
                <div className="rounded-xl border border-[var(--app-border)] p-4">
                    <p className="mb-2 text-sm font-medium text-[var(--app-text)]">Dán key có sẵn</p>
                    <Input
                        value={pasteVal}
                        onChange={(e) => setPasteVal(e.target.value)}
                        placeholder="vk_…"
                        className="mb-2 font-mono"
                        error={!!pasteErr}
                    />
                    {pasteErr && (
                        <p className="mb-2 text-xs text-[var(--app-danger)]">{pasteErr}</p>
                    )}
                    <Button variant="outline" size="sm" loading={checking} onClick={handlePaste} fullWidth>
                        Kiểm tra &amp; lưu
                    </Button>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
                <Link
                    to="/settings/api-keys"
                    className="text-xs text-[var(--app-accent)] hover:underline"
                >
                    Quản lý API keys
                </Link>
                <Button variant="ghost" size="sm" onClick={close}>Để sau</Button>
            </div>
        </Modal>
    );
}
