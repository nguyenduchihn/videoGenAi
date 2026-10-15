import api from "@/lib/api";
import type {
    BatchTasksResponse,
    CancelBatchResponse,
    CreateTasksRequest,
    CreateTasksResponse,
    ListTasksByIdsResponse,
    PortalTask,
    UploadImagesResponse,
    V1Me,
    V1Models,
} from "@/types/api";

export async function createTasks(
    payload: CreateTasksRequest,
    idempotencyKey?: string,
): Promise<CreateTasksResponse> {
    return (
        await api.post<CreateTasksResponse>("/v1/tasks", payload, {
            headers: { "Idempotency-Key": idempotencyKey ?? crypto.randomUUID() },
        })
    ).data;
}

export async function getTask(taskId: string): Promise<PortalTask> {
    return (await api.get<PortalTask>(`/v1/tasks/${taskId}`)).data;
}

export async function listTasks(ids: string[]): Promise<ListTasksByIdsResponse> {
    return (await api.get<ListTasksByIdsResponse>("/v1/tasks", { params: { ids: ids.join(",") } })).data;
}

export async function batch(batchId: string): Promise<BatchTasksResponse> {
    return (await api.get<BatchTasksResponse>(`/v1/batches/${batchId}`)).data;
}

export async function cancelTask(taskId: string): Promise<PortalTask> {
    return (await api.post<PortalTask>(`/v1/tasks/${taskId}/cancel`)).data;
}

export async function cancelBatch(batchId: string): Promise<CancelBatchResponse> {
    return (await api.post<CancelBatchResponse>(`/v1/batches/${batchId}/cancel`)).data;
}

/** Một part multipart: `name` là tên field do client đặt, backend trả lại cùng imageId để ghép vai trò. */
export interface UploadPart {
    name: string;
    file: File;
}

export interface UploadOptions {
    onUploadProgress?: (loaded: number, total: number) => void;
    signal?: AbortSignal;
}

export async function uploadImages(parts: UploadPart[], options: UploadOptions = {}): Promise<UploadImagesResponse> {
    if (parts.length === 0) return { images: [] };
    const form = new FormData();
    for (const part of parts) form.append(part.name, part.file, part.file.name);
    const { onUploadProgress, signal } = options;
    return (
        await api.post<UploadImagesResponse>("/v1/images", form, {
            signal,
            onUploadProgress: onUploadProgress
                ? (event) => onUploadProgress(event.loaded, event.total ?? event.loaded)
                : undefined,
        })
    ).data;
}

export async function models(): Promise<V1Models> {
    return (await api.get<V1Models>("/v1/models")).data;
}

export async function v1Me(): Promise<V1Me> {
    return (await api.get<V1Me>("/v1/me")).data;
}
