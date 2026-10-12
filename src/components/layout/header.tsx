import { Menu } from "lucide-react";

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({
    onMenuClick,
}: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 flex h-10 items-center border-b border-[var(--app-border)] bg-[var(--app-surface)] px-4 transition-colors sm:px-6">
            <button
                type="button"
                onClick={onMenuClick}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)] lg:hidden"
                aria-label="Mở menu"
            >
                <Menu className="h-5 w-5" />
            </button>
        </header>
    );
}
