const vi = new Intl.NumberFormat("vi-VN");

export function formatCredits(n: number): string {
    return `${vi.format(n)} Credits`;
}
export function formatVnd(n: number): string {
    return `${vi.format(n)} ₫`;
}
export function formatDate(iso: string): string {
    return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
        .format(new Date(iso));
}
export function formatRelativeTime(iso: string): string {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1_000);
    if (s < 60) return "vừa xong";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d} ngày trước`;
    const mo = Math.floor(d / 30);
    if (mo < 12) return `${mo} tháng trước`;
    return `${Math.floor(mo / 12)} năm trước`;
}
