import { useEffect, useState } from "react";
import {
    Copy,
    KeyRound,
    Plus,
    RefreshCw,
    Trash2,
} from "lucide-react";


import type {
    ApiKey,
    CreateApiKeyResponse,
} from "@/types/api";
import { apiKeyService } from "@/services/apiKey.service";

export default function ApiKeys() {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [rotating, setRotating] = useState(false);

    const [newKey, setNewKey] =
        useState<CreateApiKeyResponse | null>(null);

    const [label, setLabel] = useState("");

    const [error, setError] = useState<string | null>(null);

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
        if (!label.trim()) {
            setError("Vui lòng nhập tên API Key.");
            return;
        }

        try {
            setCreating(true);
            setError(null);

            const response =
                await apiKeyService.createApiKey({
                    label: label.trim(),
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
        const confirmed = window.confirm(
            "Bạn có chắc muốn thu hồi API Key này?",
        );

        if (!confirmed) {
            return;
        }

        try {
            await apiKeyService.revokeApiKey(id);

            await loadApiKeys();
        } catch (err) {
            console.error(err);
            setError("Không thể thu hồi API Key.");
        }
    }

    async function handleRotate() {
        const confirmed = window.confirm(
            "Xoay API Key sẽ thu hồi tất cả API Key đang hoạt động và tạo một key mới. Bạn có chắc chắn?",
        );

        if (!confirmed) {
            return;
        }

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
        }
    }

    async function handleCopy(value: string) {
        try {
            await navigator.clipboard.writeText(value);
        } catch {
            setError("Không thể sao chép API Key.");
        }
    }

    return (
        <div className="space-y-6">

            <div>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                        <KeyRound className="h-5 w-5" />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-gray-950">
                            API Keys
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Quản lý API Key dùng cho các ứng dụng bên ngoài.
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">

                    <div className="flex-1">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Tên API Key
                        </label>

                        <input
                            value={label}
                            onChange={(event) =>
                                setLabel(event.target.value)
                            }
                            placeholder="Ví dụ: VideoGen Web"
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleCreate}
                        disabled={creating}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Plus className="h-4 w-4" />

                        {creating
                            ? "Đang tạo..."
                            : "Tạo API Key"}
                    </button>

                </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white">

                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                            API Key của bạn
                        </h3>

                        <p className="mt-1 text-xs text-gray-400">
                            Quản lý các API Key đã tạo.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleRotate}
                        disabled={rotating}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            className={[
                                "h-3.5 w-3.5",
                                rotating
                                    ? "animate-spin"
                                    : "",
                            ].join(" ")}
                        />

                        {rotating
                            ? "Đang xoay..."
                            : "Xoay API Key"}
                    </button>
                </div>

                {loading ? (
                    <div className="px-6 py-12 text-center text-sm text-gray-400">
                        Đang tải API Key...
                    </div>
                ) : apiKeys.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <KeyRound className="mx-auto h-8 w-8 text-gray-300" />

                        <p className="mt-3 text-sm font-medium text-gray-700">
                            Chưa có API Key
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            Tạo API Key để sử dụng API của VideoGen AI.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {apiKeys.map((item) => {
                            const revoked = Boolean(
                                item.revokedAt,
                            );

                            return (
                                <div
                                    key={item.id}
                                    className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-sm font-medium text-gray-900">
                                                {item.label}
                                            </p>

                                            <span
                                                className={[
                                                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                                                    revoked
                                                        ? "bg-gray-100 text-gray-500"
                                                        : "bg-green-50 text-green-600",
                                                ].join(" ")}
                                            >
                                                {revoked
                                                    ? "Đã thu hồi"
                                                    : "Đang hoạt động"}
                                            </span>
                                        </div>

                                        <p className="mt-1 font-mono text-xs text-gray-500">
                                            vk_••••••••{item.last4}
                                        </p>

                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400">
                                            <span>
                                                Tạo:{" "}
                                                {new Date(
                                                    item.createdAt,
                                                ).toLocaleDateString(
                                                    "vi-VN",
                                                )}
                                            </span>

                                            <span>
                                                {item.lastUsedAt
                                                    ? `Dùng lần cuối: ${new Date(
                                                        item.lastUsedAt,
                                                    ).toLocaleDateString(
                                                        "vi-VN",
                                                    )}`
                                                    : "Chưa sử dụng"}
                                            </span>
                                        </div>
                                    </div>

                                    {!revoked && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRevoke(
                                                    item.id,
                                                )
                                            }
                                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Thu hồi
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {newKey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                            <KeyRound className="h-5 w-5" />
                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-gray-950">
                            API Key đã được tạo
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Hãy sao chép API Key ngay bây giờ.
                            Bạn có thể không xem lại đầy đủ key này
                            sau khi đóng cửa sổ.
                        </p>

                        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-3">
                            <p className="break-all font-mono text-xs text-gray-700">
                                {newKey.raw}
                            </p>
                        </div>

                        <div className="mt-5 flex gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    handleCopy(newKey.raw)
                                }
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
                            >
                                <Copy className="h-4 w-4" />
                                Sao chép
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setNewKey(null)
                                }
                                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}