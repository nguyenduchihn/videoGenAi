import api from "@/lib/api";
import type {
    BatchTasksResponse,
    CreateTasksRequest,
    CreateTasksResponse,
    PortalTask,
    PortalTasksResponse,
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

export async function listTasks(ids: string[]): Promise<PortalTasksResponse> {
    return (await api.get<PortalTasksResponse>("/v1/tasks", { params: { ids: ids.join(",") } })).data;
}

export async function batch(batchId: string): Promise<BatchTasksResponse> {
    return (await api.get<BatchTasksResponse>(`/v1/batches/${batchId}`)).data;
}

export async function cancelTask(taskId: string): Promise<PortalTask> {
    return (await api.post<PortalTask>(`/v1/tasks/${taskId}/cancel`)).data;
}

export async function cancelBatch(batchId: string): Promise<BatchTasksResponse> {
    return (await api.post<BatchTasksResponse>(`/v1/batches/${batchId}/cancel`)).data;
}

export async function uploadImages(files: File[]): Promise<UploadImagesResponse> {
    if (files.length === 0) return { images: [] };
    const fd = new FormData();
    files.forEach((f, i) => fd.append(i === 0 ? "file" : `file${i + 1}`, f));
    return (await api.post<UploadImagesResponse>("/v1/images", fd)).data;
}

export async function uploadImage(file: File): Promise<string> {
    const r = await uploadImages([file]);
    const img = r.images[0];
    if (!img) throw new Error("IMAGE_UPLOAD_FAILED");
    return img.imageId;
}

export async function models(): Promise<V1Models> {
    return (await api.get<V1Models>("/v1/models")).data;
}

export async function v1Me(): Promise<V1Me> {
    return (await api.get<V1Me>("/v1/me")).data;
}
