import { AlertCircle, Coins, Loader2, Sparkles } from "lucide-react";
import type { UploadProgress } from "@/features/generator/uploadAttachments";
import type { ValidationResult } from "@/features/generator/validation";
import type { ModeSpec } from "@/features/generator/modes";

export interface GeneratorFooterProps {
    spec: ModeSpec;
    jobCount: number;
    estimatedCredits: number;
    balance: number | null;
    validation: ValidationResult;
    showValidation: boolean;
    submitError: string | null;
    isGenerating: boolean;
    uploadProgress: UploadProgress | null;
    onGenerate: () => void;
    /** Project layout xếp dọc; default layout xếp ngang trên màn rộng. */
    stacked?: boolean;
}

const percent = (progress: UploadProgress): number => (progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 100);

function ErrorBanner({ message }: { message: string }) {
    return (
        <div role="alert" className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/20">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">Chưa thể tạo</p>
                <p className="mt-0.5 text-xs leading-5 text-red-600 dark:text-red-400">{message}</p>
            </div>
        </div>
    );
}

export default function GeneratorFooter({
    spec,
    jobCount,
    estimatedCredits,
    balance,
    validation,
    showValidation,
    submitError,
    isGenerating,
    uploadProgress,
    onGenerate,
    stacked = false,
}: GeneratorFooterProps) {
    const insufficient = balance !== null && estimatedCredits > balance;
    const validationMessage = showValidation && !validation.valid ? validation.message : null;
    const buttonLabel = spec.kind === "image" ? "Tạo ảnh" : "Tạo video";

    return (
        <div className="mt-5 border-t border-[var(--app-border)] pt-4">
            {validationMessage && <ErrorBanner message={validationMessage} />}
            {!validationMessage && submitError && <ErrorBanner message={submitError} />}

            <div className={`flex flex-col gap-4 ${stacked ? "" : "sm:flex-row sm:items-center sm:justify-between"}`}>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                    <div>
                        <p className="text-xs text-[var(--app-text-muted)]">Số job</p>
                        <p className="mt-1 text-base font-semibold text-[var(--app-text)]">{jobCount}</p>
                    </div>
                    <div className="h-7 w-px bg-[var(--app-border)]" aria-hidden="true" />
                    <div>
                        <p className="text-xs text-[var(--app-text-muted)]">Chi phí dự kiến</p>
                        <div className="mt-1 flex items-center gap-1">
                            <Coins className={`h-4 w-4 ${insufficient ? "text-[var(--app-warning)]" : "text-[var(--app-accent)]"}`} aria-hidden="true" />
                            <span className={`text-base font-semibold ${insufficient ? "text-[var(--app-warning)]" : "text-[var(--app-text)]"}`}>
                                {estimatedCredits.toLocaleString("vi-VN")}
                            </span>
                            <span className="text-xs text-[var(--app-text-muted)]">credit</span>
                        </div>
                    </div>
                    {balance !== null && (
                        <>
                            <div className="h-7 w-px bg-[var(--app-border)]" aria-hidden="true" />
                            <div>
                                <p className="text-xs text-[var(--app-text-muted)]">Số dư</p>
                                <p className="mt-1 text-base font-semibold text-[var(--app-text)]">{balance.toLocaleString("vi-VN")}</p>
                            </div>
                        </>
                    )}
                </div>

                <div className={`flex flex-col gap-2 ${stacked ? "" : "sm:items-end"}`}>
                    {insufficient && (
                        <p className="text-xs text-[var(--app-warning)]" role="status">
                            Không đủ credit (cần {estimatedCredits.toLocaleString("vi-VN")}, còn {balance.toLocaleString("vi-VN")}).
                        </p>
                    )}
                    <button
                        type="button"
                        onClick={onGenerate}
                        disabled={jobCount === 0 || isGenerating || insufficient}
                        className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--app-accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--app-accent-hover)] disabled:cursor-not-allowed disabled:bg-[var(--app-surface-soft)] disabled:text-[var(--app-text-muted)] ${stacked ? "w-full" : "w-full sm:w-auto"}`}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
                                {uploadProgress ? `Đang tải ảnh lên… ${percent(uploadProgress)}%` : "Đang gửi..."}
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" aria-hidden="true" />
                                {buttonLabel}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
