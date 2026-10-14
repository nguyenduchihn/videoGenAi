import { createContext, useContext, useId } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface TabsCtxValue {
    value: string;
    onChange: (v: string) => void;
    baseId: string;
}

const TabsCtx = createContext<TabsCtxValue | null>(null);

function useTabsCtx() {
    const ctx = useContext(TabsCtx);
    if (!ctx) throw new Error("Tabs subcomponent must be inside <Tabs>");
    return ctx;
}

interface TabsProps {
    value: string;
    onChange: (v: string) => void;
    children: ReactNode;
    className?: string;
}

export function Tabs({ value, onChange, children, className }: TabsProps) {
    const baseId = useId();
    return (
        <TabsCtx.Provider value={{ value, onChange, baseId }}>
            <div className={className}>{children}</div>
        </TabsCtx.Provider>
    );
}

export function TabsList({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            role="tablist"
            className={cn(
                "flex gap-0.5 rounded-xl bg-[var(--app-surface-soft)] p-1",
                className,
            )}
        >
            {children}
        </div>
    );
}

export function TabsTrigger({
    value,
    children,
    disabled,
}: {
    value: string;
    children: ReactNode;
    disabled?: boolean;
}) {
    const { value: active, onChange, baseId } = useTabsCtx();
    const isActive = active === value;
    return (
        <button
            type="button"
            role="tab"
            id={`${baseId}-tab-${value}`}
            aria-controls={`${baseId}-panel-${value}`}
            aria-selected={isActive}
            disabled={disabled}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(value)}
            className={cn(
                "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/40",
                isActive
                    ? "bg-[var(--app-surface)] text-[var(--app-text)] shadow-sm"
                    : "text-[var(--app-text-secondary)] hover:text-[var(--app-text)]",
                disabled && "cursor-not-allowed opacity-50",
            )}
        >
            {children}
        </button>
    );
}

export function TabsContent({
    value,
    children,
    className,
}: {
    value: string;
    children: ReactNode;
    className?: string;
}) {
    const { value: active, baseId } = useTabsCtx();
    if (active !== value) return null;
    return (
        <div
            role="tabpanel"
            id={`${baseId}-panel-${value}`}
            aria-labelledby={`${baseId}-tab-${value}`}
            tabIndex={0}
            className={cn("focus:outline-none", className)}
        >
            {children}
        </div>
    );
}
