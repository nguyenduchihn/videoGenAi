import * as v1Api from "@/api/v1.api";

/** Shim giữ API cũ cho generator; gọi thẳng src/api/v1.api (không còn nhánh mock). */
export const taskService = {
    createTasks: v1Api.createTasks,
    getTask: v1Api.getTask,
    getBatch: v1Api.batch,
    cancelTask: v1Api.cancelTask,
    cancelBatch: v1Api.cancelBatch,
};
