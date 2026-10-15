import { Menu, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface HeaderProps {
    onMenuClick: () => void;
}

/** Thanh trên cùng chỉ dùng cho mobile/tablet (< lg); desktop đã có sidebar cố định. Chiều cao = --app-header-h. */
export default function Header({
    onMenuClick,
}: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 flex h-[var(--app-header-h)] items-center gap-2 border-b border-[var(--app-border)] bg-[var(--app-surface)] px-3 transition-colors sm:px-4 lg:hidden">
            <button
                type="button"
                onClick={onMenuClick}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]"
                aria-label="Mở menu"
            >
                <Menu className="h-5 w-5" />
            </button>

            <Link
                to="/dashboard"
                className="flex min-w-0 items-center gap-2"
            >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--app-accent)]">
                    <Sparkles className="h-4 w-4 text-white" />
                </div>

                <span className="truncate text-[15px] font-semibold tracking-tight text-[var(--app-text)]">
                    VideoGen{" "}
                    <span className="text-[var(--app-accent)]">AI</span>
                </span>
            </Link>
        </header>
    );
}
