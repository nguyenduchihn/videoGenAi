/**
 * Phân trang theo cursor cho lịch sử tác vụ: URL giữ `page` (hiển thị) + `cursor` (API).
 * API chỉ đi tới (nextCursor) ⇒ ghi nhớ cursor của từng trang đã qua để "Trang trước" quay lại đúng trang;
 * tải lại trang giữa chừng thì không còn vết ⇒ "Trang trước" đưa về trang 1.
 */
export interface TaskPageState {
    page: number;
    cursor?: string;
}

/** page ↦ cursor của trang đó (trang 1 không có cursor). */
export type CursorTrail = ReadonlyMap<number, string | undefined>;
export const emptyTrail = (): CursorTrail => new Map([[1, undefined]]);

export function readPageState(params: URLSearchParams): TaskPageState {
    const cursor = params.get("cursor") ?? undefined;
    const raw = Number.parseInt(params.get("page") ?? "1", 10);
    const page = Number.isFinite(raw) && raw > 1 ? raw : 1;
    if (!cursor) return { page: 1 };
    return { page: Math.max(2, page), cursor };
}

export function rememberCursor(trail: CursorTrail, state: TaskPageState): CursorTrail {
    if (trail.get(state.page) === state.cursor && trail.has(state.page)) return trail;
    return new Map([...trail, [state.page, state.cursor]]);
}

/** Trang kế: cần nextCursor từ API. */
export const nextPageState = (current: TaskPageState, nextCursor: string): TaskPageState => ({ page: current.page + 1, cursor: nextCursor });

/** Trang trước: dùng vết đã nhớ; mất vết (vừa tải lại) ⇒ về trang 1. */
export function prevPageState(current: TaskPageState, trail: CursorTrail): TaskPageState {
    const target = current.page - 1;
    if (target <= 1 || !trail.has(target)) return { page: 1 };
    const cursor = trail.get(target);
    return cursor ? { page: target, cursor } : { page: 1 };
}

/** Ghi trạng thái trang vào query string (không sửa params gốc). */
export function withPageState(params: URLSearchParams, state: TaskPageState): URLSearchParams {
    const next = new URLSearchParams(params);
    if (state.cursor && state.page > 1) {
        next.set("page", String(state.page));
        next.set("cursor", state.cursor);
    } else {
        next.delete("page");
        next.delete("cursor");
    }
    return next;
}
