import { AlertTriangle, Check, Copy, KeyRound, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge, Button, Card, EmptyState, ErrorPanel, Field, Input, Modal, Skeleton } from "@/components/ui";
import { useFeedback } from "@/hooks/useFeedback";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { apiKeyService } from "@/services/apiKey.service";
import { useApiKeyStore } from "@/stores/apiKey.store";
import type { ApiKey, CreateApiKeyResponse } from "@/types/api";

export default function ApiKeys() {
    const { confirm, toast, withOverlay } = useFeedback();
    const storeKey = useApiKeyStore((s) => s.key);
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [label, setLabel] = useState("");
    const [labelError, setLabelError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [newKey, setNewKey] = useState<CreateApiKeyResponse | null>(null);

    useEffect(() => {
        void loadApiKeys();
    }, []);

    async function loadApiKeys() {
        try {
            setLoading(true);
            setLoadError(null);
            const response = await apiKeyService.getApiKeys();
            setApiKeys(response.items ?? []);
        } catch (err) {
            setLoadError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    /** Key mới (tạo/xoay) được dùng ngay cho trình tạo video trên trình duyệt này. */
    function rememberKey(issued: CreateApiKeyResponse) {
        useApiKeyStore.getState().setKey({ raw: issued.raw, last4: issued.last4, keyId: issued.id });
        setNewKey(issued);
    }

    async function handleCreate() {
        const trimmed = label.trim();
        if (!trimmed) {
            setLabelError("Vui lòng nhập tên API Key.");
            return;
        }
        setLabelError(null);
        try {
            setCreating(true);
            rememberKey(await apiKeyService.createApiKey({ label: trimmed }));
            setLabel("");
            await loadApiKeys();
        } catch (err) {
            toast.error(err);
        } finally {
            setCreating(false);
        }
    }

    async function handleRevoke(item: ApiKey) {
        const ok = await confirm({
            title: "Thu hồi API Key?",
            body: `Key "${item.label}" sẽ bị từ chối ngay lập tức; ứng dụng đang dùng key này sẽ nhận lỗi 401.`,
            confirmLabel: "Thu hồi",
            danger: true,
        });
        if (!ok) return;
        try {
            await withOverlay(apiKeyService.revokeApiKey(item.id), "Đang thu hồi…");
            if (useApiKeyStore.getState().key?.keyId === item.id) useApiKeyStore.getState().clearKey();
            toast.success("Đã thu hồi API Key.");
            await loadApiKeys();
        } catch (err) {
            toast.error(err);
        }
    }

    async function handleRotate() {
        const ok = await confirm({
            title: "Xoay API Key?",
            body: "Mọi key đang hoạt động sẽ bị thu hồi và một key mới được cấp. Dùng khi nghi ngờ lộ key.",
            confirmLabel: "Xoay key",
            danger: true,
        });
        if (!ok) return;
        try {
            rememberKey(await withOverlay(apiKeyService.rotateApiKey(), "Đang xoay key…"));
            await loadApiKeys();
        } catch (err) {
            toast.error(err);
        }
    }

    const activeCount = apiKeys.filter((item) => !item.revokedAt).length;

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                    <KeyRound className="h-5 w-5" aria-hidden />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-[var(--app-text)]">API Keys</h2>
                    <p className="mt-1 text-sm text-[var(--app-text-secondary)]">Dùng cho trình tạo video trên web và các ứng dụng gọi API bên ngoài.</p>
                </div>
            </div>

            <Card as="section" aria-labelledby="create-key-title">
                <h3 id="create-key-title" className="text-sm font-semibold text-[var(--app-text)]">Tạo API Key</h3>
                <p className="mt-1 text-xs text-[var(--app-text-secondary)]">Đặt tên để dễ nhận biết key đang được dùng ở đâu.</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="flex-1">
                        <Field label="Tên API Key" error={labelError ?? undefined}>
                            <Input
                                value={label}
                                onChange={(event) => setLabel(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" && !creating) void handleCreate();
                                }}
                                placeholder="Ví dụ: VideoGen Web"
                                disabled={creating}
                            />
                        </Field>
                    </div>
                    <Button size="lg" className="sm:mt-6" loading={creating} onClick={() => void handleCreate()}>
                        <Plus className="h-4 w-4" aria-hidden />
                        Tạo API Key
                    </Button>
                </div>
            </Card>

            <Card as="section" flush aria-labelledby="keys-title">
                <div className="flex flex-col gap-3 border-b border-[var(--app-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 id="keys-title" className="text-sm font-semibold text-[var(--app-text)]">API Key của bạn</h3>
                        <p className="mt-1 text-xs text-[var(--app-text-secondary)]">{activeCount} key đang hoạt động.</p>
                    </div>
                    <Button variant="outline" size="sm" disabled={activeCount === 0} onClick={() => void handleRotate()}>
                        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                        Xoay API Key
                    </Button>
                </div>

                {loading ? (
                    <div className="space-y-3 p-5">
                        <Skeleton className="h-14" />
                        <Skeleton className="h-14" />
                    </div>
                ) : loadError ? (
                    <div className="p-5">
                        <ErrorPanel message={loadError} onRetry={() => void loadApiKeys()} />
                    </div>
                ) : apiKeys.length === 0 ? (
                    <EmptyState icon={KeyRound} title="Chưa có API Key" description="Tạo API Key để sử dụng API của VideoGen AI." />
                ) : (
                    <ul className="divide-y divide-[var(--app-border)]">
                        {apiKeys.map((item) => {
                            const revoked = Boolean(item.revokedAt);
                            const inUse = !revoked && storeKey?.keyId === item.id;
                            return (
                                <li key={item.id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate text-sm font-medium text-[var(--app-text)]">{item.label}</p>
                                            <Badge variant={revoked ? "neutral" : "success"}>{revoked ? "Đã thu hồi" : "Đang hoạt động"}</Badge>
                                            {inUse && <Badge variant="accent">Đang dùng trên trình duyệt này</Badge>}
                                        </div>
                                        <p className="mt-1 font-mono text-xs text-[var(--app-text-secondary)]">vk_••••••••{item.last4}</p>
                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--app-text-muted)]">
                                            <span>Tạo: {formatDate(item.createdAt)}</span>
                                            <span>{item.lastUsedAt ? `Dùng lần cuối: ${formatDate(item.lastUsedAt)}` : "Chưa sử dụng"}</span>
                                        </div>
                                    </div>
                                    {!revoked && (
                                        <Button variant="outline" size="sm" className="shrink-0 border-[var(--app-danger)]/30 text-[var(--app-danger)] hover:bg-[var(--app-danger-soft)]" onClick={() => void handleRevoke(item)}>
                                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                                            Thu hồi
                                        </Button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Card>

            <NewKeyModal key={newKey?.id ?? "none"} issued={newKey} onClose={() => setNewKey(null)} />
        </div>
    );
}

function NewKeyModal({ issued, onClose }: { issued: CreateApiKeyResponse | null; onClose: () => void }) {
    const { toast } = useFeedback();
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        if (!issued) return;
        try {
            await navigator.clipboard.writeText(issued.raw);
            setCopied(true);
        } catch {
            toast.error("Không thể sao chép API Key, hãy chọn và sao chép thủ công.");
        }
    }

    return (
        <Modal open={Boolean(issued)} onClose={onClose} title="API Key đã được tạo" description="Hãy sao chép ngay: key đầy đủ chỉ hiện một lần." size="md">
            {issued && (
                <div className="space-y-4">
                    <p className="text-xs text-[var(--app-text-muted)]">Key đã được lưu cho trình duyệt này để tạo video. Nhãn: {issued.label}</p>
                    <div className="flex gap-2 rounded-xl border border-[var(--app-warning)]/20 bg-[var(--app-warning-soft)] p-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--app-warning)]" aria-hidden />
                        <p className="text-xs leading-5 text-[var(--app-warning)]">Không chia sẻ API Key với người khác. Nếu nghi ngờ lộ key, hãy xoay key.</p>
                    </div>
                    <code className="block break-all rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-3 font-mono text-xs leading-5 text-[var(--app-text)]">
                        {issued.raw}
                    </code>
                    <div className="flex gap-3">
                        <Button fullWidth onClick={() => void handleCopy()}>
                            {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                            {copied ? "Đã sao chép" : "Sao chép"}
                        </Button>
                        <Button variant="outline" onClick={onClose}>Đóng</Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
