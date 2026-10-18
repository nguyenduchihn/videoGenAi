import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/cn";

/** Clipboard API cần HTTPS; thiếu (HTTP nội bộ, trình duyệt cũ, bị từ chối quyền) ⇒ thử execCommand qua textarea ẩn. */
async function copyText(value: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(value);
        return true;
    } catch {
        try {
            const ta = document.createElement("textarea");
            ta.value = value;
            ta.setAttribute("readonly", "");
            ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand("copy");
            document.body.removeChild(ta);
            return ok;
        } catch {
            return false;
        }
    }
}

interface CopyButtonProps {
    value: string;
    label?: string;
    className?: string;
}

export function CopyButton({ value, label, className }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!(await copyText(value))) return;
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Đã sao chép" : (label ?? "Sao chép")}
            className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition",
                "text-[var(--app-text-muted)] hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text-secondary)]",
                copied && "text-[var(--app-success)]",
                className,
            )}
        >
            {copied ? (
                <Check className="h-3.5 w-3.5" aria-hidden />
            ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden />
            )}
            {label && <span>{copied ? "Đã sao chép" : label}</span>}
        </button>
    );
}
