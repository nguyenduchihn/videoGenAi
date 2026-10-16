/** Điều hướng tablist theo WAI-ARIA: mũi tên trái/phải (hoặc lên/xuống) vòng tròn, Home/End; null = phím khác, không xử lý. */
export function nextTabIndex(key: string, index: number, count: number): number | null {
    if (count === 0) return null;
    switch (key) {
        case "ArrowRight":
        case "ArrowDown":
            return (index + 1) % count;
        case "ArrowLeft":
        case "ArrowUp":
            return (index - 1 + count) % count;
        case "Home":
            return 0;
        case "End":
            return count - 1;
        default:
            return null;
    }
}
