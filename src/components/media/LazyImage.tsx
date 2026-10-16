import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLazySource } from "./useLazySource";

interface LazyImageProps {
    src: string;
    alt: string;
    /** Lớp cho <img> (object-fit…). */
    className?: string;
    /** Lớp cho khung bọc (kích thước do cha quyết định: aspect-*, h-full…). */
    wrapperClassName?: string;
    /** Ẩn icon chờ (thumbnail nhỏ). */
    plain?: boolean;
    rootMargin?: string;
    onLoad?: () => void;
    onError?: () => void;
}

/** Ảnh chỉ tải khi cuộn tới (IntersectionObserver) và tới lượt trong hàng đợi; chờ thì hiện khung xám, tải xong mờ dần vào. */
export function LazyImage({ src, alt, className, wrapperClassName, plain = false, rootMargin, onLoad, onError }: LazyImageProps) {
    const { ref, activeSrc, phase, settle } = useLazySource(src, rootMargin);
    return (
        <div ref={ref} className={cn("relative h-full w-full overflow-hidden bg-[var(--app-surface-soft)]", wrapperClassName)}>
            {phase !== "loaded" && (
                <div className={cn("absolute inset-0 flex items-center justify-center text-[var(--app-text-muted)]", phase === "loading" && "motion-safe:animate-pulse")} aria-hidden="true">
                    {!plain && <ImageIcon className="h-6 w-6 opacity-60" />}
                </div>
            )}
            {activeSrc && (
                <img
                    src={activeSrc}
                    alt={alt}
                    decoding="async"
                    onLoad={() => { settle("loaded"); onLoad?.(); }}
                    onError={() => { settle("error"); onError?.(); }}
                    className={cn("h-full w-full transition-opacity duration-300", phase === "loaded" ? "opacity-100" : "opacity-0", className)}
                />
            )}
        </div>
    );
}
