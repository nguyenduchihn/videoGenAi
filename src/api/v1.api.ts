import api from "@/lib/api";
import type {
    BatchTasksResponse,
    CancelBatchResponse,
    CancelRunResponse,
    CreateTaskItem,
    CreateTasksRequest,
    CreateTasksResponse,
    EnqueueRunItemsResponse,
    ListTasksByIdsResponse,
    PortalTask,
    RunStatus,
    RunSummary,
    RunsPage,
    RunTasksPage,
    TaskStatus,
    UploadImagesResponse,
    V1Me,
    V1Models,
    V1Voices,
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

export async function voices(): Promise<V1Voices> {
    return (await api.get<V1Voices>("/v1/voices")).data;
}

export async function v1Me(): Promise<V1Me> {
    return (await api.get<V1Me>("/v1/me")).data;
}

// ── Lượt tạo ──
export interface UpsertRunInput {
    name?: string | null;
    totalPlanned: number;
}

/** PUT idempotent theo id client: 201 lần đầu, 200 nếu đã có. */
export async function upsertRun(id: string, input: UpsertRunInput): Promise<{ run: RunSummary; created: boolean }> {
    const response = await api.put<RunSummary>(`/v1/runs/${id}`, input);
    return { run: response.data, created: response.status === 201 };
}

export async function listRuns(params: { status?: RunStatus; cursor?: string; limit?: number } = {}): Promise<RunsPage> {
    return (await api.get<RunsPage>("/v1/runs", { params })).data;
}

export async function getRun(id: string): Promise<RunSummary> {
    return (await api.get<RunSummary>(`/v1/runs/${id}`)).data;
}

export async function listRunTasks(id: string, params: { status?: TaskStatus; cursor?: string; limit?: number } = {}): Promise<RunTasksPage> {
    return (await api.get<RunTasksPage>(`/v1/runs/${id}/tasks`, { params })).data;
}

export async function cancelRun(id: string): Promise<CancelRunResponse> {
    return (await api.post<CancelRunResponse>(`/v1/runs/${id}/cancel`)).data;
}

export async function renameRun(id: string, name: string | null): Promise<RunSummary> {
    return (await api.patch<RunSummary>(`/v1/runs/${id}`, { name })).data;
}

/** Giai đoạn 2: xếp hàng job trên máy chủ (lượt vượt hạn mức hàng đợi của gói). */
export async function enqueueRunItems(id: string, input: { items: CreateTaskItem[]; runOffset: number }): Promise<EnqueueRunItemsResponse> {
    return (await api.post<EnqueueRunItemsResponse>(`/v1/runs/${id}/items`, input)).data;
}

/** Tạo lại các task thất bại của lượt (máy chủ giữ spec/ảnh); `taskIds` bỏ trống = tất cả. */
export async function retryFailedRun(id: string, taskIds?: string[]): Promise<{ created: number; skipped: number; run: RunSummary }> {
    return (await api.post<{ created: number; skipped: number; run: RunSummary }>(`/v1/runs/${id}/retry-failed`, taskIds ? { taskIds } : {})).data;
}
