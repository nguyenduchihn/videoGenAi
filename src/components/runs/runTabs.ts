import type { TaskStatus } from "@/types/api";

export type RunTab = "all" | "active" | "succeeded" | "failed" | "cancelled";
export type RunViewMode = "cards" | "rows";

/** Tab ⇒ tham số `status` của API (active = chưa xong: pending + processing, lọc phía client). */
export const tabToStatus = (tab: RunTab): TaskStatus | undefined => (tab === "all" || tab === "active" ? undefined : tab);
