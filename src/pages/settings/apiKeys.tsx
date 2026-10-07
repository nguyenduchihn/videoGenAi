import { useEffect, useState } from "react";
import {
    AlertTriangle,
    Check,
    Copy,
    KeyRound,
    Plus,
    RefreshCw,
    Trash2,
    X,
} from "lucide-react";

import type {
    ApiKey,
    CreateApiKeyResponse,
} from "@/types/api";

import { apiKeyService } from "@/services/apiKey.service";

type ConfirmAction =
    | {
        type: "revoke";
        keyId: string;
        label: string;
    }
    | {
        type: "rotate";
    }
    | null;

export default function ApiKeys() {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);

    const [creating, setCreating] = useState(false);
    const [rotating, setRotating] = useState(false);

    const [newKey, setNewKey] =
        useState<CreateApiKeyResponse | null>(null);

    const [label, setLabel] = useState("");

    const [error, setError] = useState<string | null>(null);

    const [confirmAction, setConfirmAction] =
        useState<ConfirmAction>(null);

    const [actionId, setActionId] =
        useState<string | null>(null);

    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadApiKeys();
    }, []);

    async function loadApiKeys() {
        try {
            setLoading(true);
            setError(null);

            const response =
                await apiKeyService.getApiKeys();

            setApiKeys(response.items);
        } catch (err) {
            console.error(err);
            setError("Không thể tải API Key.");
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate() {
        const trimmedLabel = label.trim();

        if (!trimmedLabel) {
            setError("Vui lòng nhập tên API Key.");
            return;
        }

        try {
            setCreating(true);
            setError(null);

            const response =
                await apiKeyService.createApiKey({
                    label: trimmedLabel,
                });

            setNewKey(response);
            setLabel("");

            await loadApiKeys();
        } catch (err) {
            console.error(err);
            setError("Không thể tạo API Key.");
        } finally {
            setCreating(false);
        }
    }

    async function handleRevoke(id: string) {
        try {
            setActionId(id);
            setError(null);

            await apiKeyService.revokeApiKey(id);

            await loadApiKeys();
        } catch (err) {
            console.error(err);
            setError("Không thể thu hồi API Key.");
        } finally {
            setActionId(null);
            setConfirmAction(null);
        }
    }

    async function handleRotate() {
        try {
            setRotating(true);
            setError(null);

            const response =
                await apiKeyService.rotateApiKey();

            setNewKey(response);

            await loadApiKeys();
        } catch (err) {
            console.error(err);
            setError("Không thể xoay API Key.");
        } finally {
            setRotating(false);
            setConfirmAction(null);
        }
    }

    async function handleCopy(value: string) {
        try {
            await navigator.clipboard.writeText(value);

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch {
            setError("Không thể sao chép API Key.");
        }
    }
    return (
        <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                        <KeyRound className="h-5 w-5" />
                    </div>

                    <div>
                        <h1 className="text-xl font-semibold text-[var(--app-text)]">
                            API Keys
                        </h1>

                        <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
                            Quản lý API Key dùng cho các ứng dụng bên ngoài.
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => setError(null)}
                        className="shrink-0 rounded-md p-1 transition hover:bg-red-100 dark:hover:bg-red-500/10"
                        aria-label="Đóng thông báo lỗi"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <section className="mb-6 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 sm:p-6">
                <div className="mb-4">
                    <h2 className="text-sm font-semibold text-[var(--app-text)]">
                        Tạo API Key
                    </h2>

                    <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                        Đặt tên để dễ nhận biết API Key đang được sử dụng ở đâu.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex-1">
                        <label
                            htmlFor="api-key-label"
                            className="sr-only"
                        >
                            Tên API Key
                        </label>

                        <input
                            id="api-key-label"
                            value={label}
                            onChange={(event) =>
                                setLabel(event.target.value)
                            }
                            onKeyDown={(event) => {
                                if (
                                    event.key === "Enter" &&
                                    !creating
                                ) {
                                    handleCreate();
                                }
                            }}
                            placeholder="Ví dụ: VideoGen Web"
                            className="h-11 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 text-sm text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-accent)] focus:ring-2 focus:ring-[var(--app-accent)]/10"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleCreate}
                        disabled={creating}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--app-accent)] px-5 text-sm font-medium text-white transition hover:bg-[var(--app-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Plus className="h-4 w-4" />

                        {creating
                            ? "Đang tạo..."
                            : "Tạo API Key"}
                    </button>
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]">
                <div className="flex flex-col gap-3 border-b border-[var(--app-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <h2 className="text-sm font-semibold text-[var(--app-text)]">
                            API Key của bạn
                        </h2>

                        <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                            Quản lý các API Key đã tạo.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setConfirmAction({
                                type: "rotate",
                            })
                        }
                        disabled={
                            rotating ||
                            apiKeys.filter(
                                (item) => !item.revokedAt
                            ).length === 0
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--app-border)] px-3 py-2 text-xs font-medium text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-3.5 w-3.5 ${rotating
                                    ? "animate-spin"
                                    : ""
                                }`}
                        />

                        {rotating
                            ? "Đang xoay..."
                            : "Xoay API Key"}
                    </button>
                </div>

                {loading ? (
                    <div className="px-6 py-12 text-center text-sm text-[var(--app-text-secondary)]">
                        Đang tải API Key...
                    </div>
                ) : apiKeys.length === 0 ? (
                    <div className="px-6 py-14 text-center">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--app-surface-soft)] text-[var(--app-text-muted)]">
                            <KeyRound className="h-5 w-5" />
                        </div>

                        <p className="mt-4 text-sm font-medium text-[var(--app-text)]">
                            Chưa có API Key
                        </p>

                        <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                            Tạo API Key để sử dụng API của VideoGen AI.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--app-border)]">
                        {apiKeys.map((item) => {
                            const revoked =
                                Boolean(item.revokedAt);

                            const busy =
                                actionId === item.id;

                            return (
                                <div
                                    key={item.id}
                                    className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate text-sm font-medium text-[var(--app-text)]">
                                                {item.label}
                                            </p>

                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${revoked
                                                        ? "bg-[var(--app-surface-soft)] text-[var(--app-text-muted)]"
                                                        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                                    }`}
                                            >
                                                {revoked
                                                    ? "Đã thu hồi"
                                                    : "Đang hoạt động"}
                                            </span>
                                        </div>

                                        <p className="mt-1 font-mono text-xs text-[var(--app-text-secondary)]">
                                            vk_••••••••
                                            {item.last4}
                                        </p>

                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--app-text-muted)]">
                                            <span>
                                                Tạo:{" "}
                                                {new Date(
                                                    item.createdAt
                                                ).toLocaleDateString(
                                                    "vi-VN"
                                                )}
                                            </span>

                                            <span>
                                                {item.lastUsedAt
                                                    ? `Dùng lần cuối: ${new Date(
                                                        item.lastUsedAt
                                                    ).toLocaleDateString(
                                                        "vi-VN"
                                                    )}`
                                                    : "Chưa sử dụng"}
                                            </span>
                                        </div>
                                    </div>

                                    {!revoked && (
                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={() =>
                                                setConfirmAction({
                                                    type: "revoke",
                                                    keyId: item.id,
                                                    label: item.label,
                                                })
                                            }
                                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />

                                            {busy
                                                ? "Đang xử lý..."
                                                : "Thu hồi"}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {newKey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-2xl">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                            <KeyRound className="h-5 w-5" />
                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-[var(--app-text)]">
                            API Key đã được tạo
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[var(--app-text-secondary)]">
                            Hãy sao chép API Key ngay bây giờ.
                            Bạn sẽ không thể xem lại đầy đủ key này
                            sau khi đóng cửa sổ.
                        </p>

                        <div className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-500/10">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />

                            <p className="text-xs leading-5 text-amber-700 dark:text-amber-300">
                                Không chia sẻ API Key với người khác.
                            </p>
                        </div>

                        <div className="mt-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-3">
                            <p className="break-all font-mono text-xs leading-5 text-[var(--app-text)]">
                                {newKey.raw}
                            </p>
                        </div>

                        <div className="mt-5 flex gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    handleCopy(newKey.raw)
                                }
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--app-accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--app-accent-hover)]"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}

                                {copied
                                    ? "Đã sao chép"
                                    : "Sao chép"}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setNewKey(null)
                                }
                                className="rounded-xl border border-[var(--app-border)] px-4 py-2.5 text-sm font-medium text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmAction && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-2xl">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                            <AlertTriangle className="h-5 w-5" />
                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-[var(--app-text)]">
                            {confirmAction.type === "rotate"
                                ? "Xoay API Key?"
                                : "Thu hồi API Key?"}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[var(--app-text-secondary)]">
                            {confirmAction.type === "rotate"
                                ? "API Key đang hoạt động sẽ bị vô hiệu hóa và một key mới sẽ được tạo."
                                : `API Key "${confirmAction.label}" sẽ không thể sử dụng sau khi thu hồi.`}
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setConfirmAction(null)
                                }
                                className="rounded-xl border border-[var(--app-border)] px-4 py-2.5 text-sm font-medium text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]"
                            >
                                Hủy
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (
                                        confirmAction.type ===
                                        "rotate"
                                    ) {
                                        handleRotate();
                                    } else {
                                        handleRevoke(
                                            confirmAction.keyId
                                        );
                                    }
                                }}
                                disabled={
                                    rotating ||
                                    Boolean(
                                        actionId
                                    )
                                }
                                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {confirmAction.type === "rotate"
                                    ? "Xoay API Key"
                                    : "Thu hồi"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}