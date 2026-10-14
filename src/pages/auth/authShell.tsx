import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
    title: string;
    subtitle?: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: Props) {
    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
            <div className="w-full max-w-[420px]">
                <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-accent)]">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-[17px] font-semibold text-[var(--app-text)]">VideoGen AI</span>
                </Link>
                <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-7 shadow-sm">
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--app-text)]">{title}</h1>
                    {subtitle && <p className="mt-2 text-sm leading-6 text-[var(--app-text-secondary)]">{subtitle}</p>}
                    <div className="mt-6">{children}</div>
                </div>
                {footer && <div className="mt-5 text-center text-sm text-[var(--app-text-secondary)]">{footer}</div>}
            </div>
        </div>
    );
}
