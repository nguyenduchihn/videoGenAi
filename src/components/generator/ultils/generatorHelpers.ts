
import { taskService } from "@/services/task.service";
import type { PortalTask } from "@/types/api";
import type { GeneratorFilesState, GeneratorMode } from "../types";

export const IMAGE_MODES: GeneratorMode[] = [
    "text-to-image",
    "batch-image",
];

export const MODEL_CREDIT_COST: Record<string, number> = {
    "Veo_3.1-Lite": 5,
    "Nano_Banana_2_Lite": 1,
};

export type ValidationResult = {
    valid: boolean;
    message?: string;
};

export function getDefaultModel(mode: GeneratorMode): string {
    if (IMAGE_MODES.includes(mode)) {
        return "Nano_Banana_2_Lite";
    }

    return "Veo_3.1-Lite";
}

export function validateGenerator(
    mode: GeneratorMode,
    jobs: string[],
    files: GeneratorFilesState,
): ValidationResult {
    if (jobs.length === 0) {
        return {
            valid: false,
            message: "Vui lòng nhập prompt.",
        };
    }

    switch (mode) {
        case "text-to-video":
            return {
                valid: true,
            };

        case "image-to-video":
            if (files.startFrame.length === 0) {
                return {
                    valid: false,
                    message: "Vui lòng tải lên Start Frame.",
                };
            }

            return {
                valid: true,
            };

        case "components":
            if (files.components.length === 0) {
                return {
                    valid: false,
                    message: "Vui lòng tải lên ít nhất 1 thành phần.",
                };
            }

            return {
                valid: true,
            };

        case "text-to-image":
            return {
                valid: true,
            };

        case "batch-image":
            if (
                files.fixedImages.length === 0 &&
                files.dynamicImages.length === 0
            ) {
                return {
                    valid: false,
                    message:
                        "Vui lòng tải lên ảnh Fixed hoặc Dynamic.",
                };
            }

            return {
                valid: true,
            };

        case "reference-video-voice":
            if (files.referenceVideos.length === 0) {
                return {
                    valid: false,
                    message:
                        "Vui lòng tải lên Reference Video.",
                };
            }

            if (files.voiceAudio.length === 0) {
                return {
                    valid: false,
                    message:
                        "Vui lòng tải lên Voice Audio.",
                };
            }

            return {
                valid: true,
            };

        case "batch-reference":
            if (files.batchReferences.length === 0) {
                return {
                    valid: false,
                    message:
                        "Vui lòng tải lên ít nhất 1 Reference.",
                };
            }

            return {
                valid: true,
            };

        default:
            return {
                valid: false,
                message: "Chế độ tạo không hợp lệ.",
            };
    }
}

export function getGeneratorErrorMessage(error: unknown): string {
    const axiosError = error as {
        response?: {
            data?: {
                error?: {
                    code?: string;
                    message?: string;
                    requestId?: string;
                };
            };
        };
    };

    const apiError = axiosError.response?.data?.error;

    if (!apiError) {
        return error instanceof Error
            ? error.message
            : "Không thể tạo tác vụ.";
    }

    switch (apiError.code) {
        case "UNUSUAL_ACTIVITY":
            return "Hệ thống AI đang tạm thời từ chối yêu cầu do kiểm tra bảo mật. Credit đã được hoàn lại. Vui lòng thử lại sau.";

        case "RATE_LIMITED":
            return "Bạn đang tạo quá nhiều tác vụ. Vui lòng chờ một lúc rồi thử lại.";

        case "VALIDATION_FAILED":
            return apiError.message ?? "Dữ liệu tạo không hợp lệ.";

        case "INSUFFICIENT_CREDITS":
            return "Không đủ credits để thực hiện tác vụ.";

        case "PLAN_EXPIRED":
            return "Gói sử dụng của bạn đã hết hạn.";

        default:
            return (
                apiError.message ??
                "Không thể tạo tác vụ."
            );
    }
}

export function getTaskErrorMessage(
    code?: string,
    message?: string,
): string {
    switch (code) {
        case "UNUSUAL_ACTIVITY":
            return "Hệ thống AI đang tạm thời từ chối yêu cầu do kiểm tra bảo mật. Credit đã được hoàn lại. Vui lòng thử lại sau.";

        case "RATE_LIMITED":
            return "Bạn đang tạo quá nhiều tác vụ. Vui lòng chờ một lúc rồi thử lại.";

        case "INSUFFICIENT_CREDITS":
            return "Không đủ credits để thực hiện tác vụ.";

        case "API_ERROR":
            return "Dịch vụ AI gặp lỗi khi xử lý yêu cầu. Credit đã được hoàn lại.";

        default:
            return message ?? "Tác vụ không thể hoàn thành.";
    }
}

export async function pollBatch(
    batchId: string,
    onUpdate: (tasks: PortalTask[]) => void,
    signal?: AbortSignal,
): Promise<PortalTask[]> {
    const maxAttempts = 40;
    const interval = 3000;

    let lastTasks: PortalTask[] = [];

    const wait = (ms: number): Promise<void> =>
        new Promise((resolve, reject) => {
            if (signal?.aborted) {
                reject(new DOMException("Polling cancelled", "AbortError"));
                return;
            }

            const timeoutId = setTimeout(() => {
                signal?.removeEventListener("abort", onAbort);
                resolve();
            }, ms);

            const onAbort = () => {
                clearTimeout(timeoutId);
                signal?.removeEventListener("abort", onAbort);
                reject(new DOMException("Polling cancelled", "AbortError"));
            };

            signal?.addEventListener("abort", onAbort, { once: true });
        });

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (signal?.aborted) {
            return lastTasks;
        }

        const response = await taskService.getBatch(batchId);

        if (signal?.aborted) {
            return lastTasks;
        }

        lastTasks = response.tasks;
        onUpdate(lastTasks);

        const allFinished =
            lastTasks.length > 0 &&
            lastTasks.every((task) =>
                ["succeeded", "failed", "cancelled"].includes(task.status),
            );

        if (allFinished) {
            return lastTasks;
        }

        if (attempt < maxAttempts - 1) {
            try {
                await wait(interval);
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === "AbortError"
                ) {
                    return lastTasks;
                }

                throw error;
            }
        }
    }

    return lastTasks;
}

