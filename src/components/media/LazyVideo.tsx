import { Video as VideoIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLazySource } from "./useLazySource";

interface LazyVideoProps {
    src: string;
    className?: string;
    wrapperClassName?: string;
    controls?: boolean;
    muted?: boolean;
    plain?: boolean;
    rootMargin?: string;
    "aria-label"?: string;
    onError?: () => void;
}

/** Video chỉ gắn src (preload=metadata ⇒ khung hình đầu) khi cuộn tới và tới lượt; trước đó chỉ là khung chờ, không tốn băng thông. */
export function LazyVideo({ src, className, wrapperClassName, controls = false, muted = false, plain = false, rootMargin, onError, ...rest }: LazyVideoProps) {
    const { ref, activeSrc, phase, settle } = useLazySource(src, rootMargin);
    return (
        <div ref={ref} className={cn("relative h-full w-full overflow-hidden bg-[var(--app-surface-soft)]", wrapperClassName)}>
            {phase !== "loaded" && (
                <div className={cn("absolute inset-0 flex items-center justify-center text-[var(--app-text-muted)]", phase === "loading" && "motion-safe:animate-pulse")} aria-hidden="true">
                    {!plain && <VideoIcon className="h-6 w-6 opacity-60" />}
                </div>
            )}
            {activeSrc && (
                <video
                    src={activeSrc}
                    preload="metadata"
                    controls={controls}
                    muted={muted}
                    playsInline
                    aria-label={rest["aria-label"]}
                    onLoadedMetadata={() => settle("loaded")}
                    onError={() => { settle("error"); onError?.(); }}
                    className={cn("h-full w-full transition-opacity duration-300", phase === "loaded" ? "opacity-100" : "opacity-0", className)}
                />
            )}
        </div>
    );
}
