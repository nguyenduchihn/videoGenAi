import { cloneElement, forwardRef, isValidElement, useId, useState } from "react";
import type { ReactElement } from "react";
import type {
    InputHTMLAttributes,
    TextareaHTMLAttributes,
    ReactNode,
} from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

/* ── Field wrapper ─────────────────────────────────────────── */
interface FieldProps {
    label?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    children: ReactNode;
    htmlFor?: string;
}

export function Field({
    label,
    hint,
    error,
    required,
    children,
    htmlFor,
}: FieldProps) {
    const autoId = useId();
    type ControlProps = { id?: string; "aria-describedby"?: string };
    const child = isValidElement<ControlProps>(children) ? (children as ReactElement<ControlProps>) : null;
    const inputId = htmlFor ?? child?.props.id ?? autoId;
    const messageId = error || hint ? `${inputId}-msg` : undefined;
    const control = child
        ? cloneElement(child, {
              id: inputId,
              "aria-describedby": [child.props["aria-describedby"], messageId].filter(Boolean).join(" ") || undefined,
          })
        : children;
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-sm font-medium text-[var(--app-text)]"
                >
                    {label}
                    {required && (
                        <span
                            className="ml-1 text-[var(--app-danger)]"
                            aria-hidden
                        >
                            *
                        </span>
                    )}
                </label>
            )}
            {control}
            {error ? (
                <p id={messageId} role="alert" className="text-xs text-[var(--app-danger)]">
                    {error}
                </p>
            ) : hint ? (
                <p id={messageId} className="text-xs text-[var(--app-text-muted)]">{hint}</p>
            ) : null}
        </div>
    );
}

/* ── Input ─────────────────────────────────────────────────── */
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    error?: boolean;
    leading?: ReactNode;
    trailing?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
    function Input({ error, leading, trailing, className, ...props }, ref) {
        return (
            <div className="relative flex items-center">
                {leading && (
                    <span className="pointer-events-none absolute left-3 text-[var(--app-text-muted)]">
                        {leading}
                    </span>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "h-9 w-full rounded-lg border px-3 text-sm transition",
                        "bg-[var(--app-surface)] text-[var(--app-text)]",
                        "placeholder:text-[var(--app-text-muted)]",
                        "focus:outline-none focus:ring-2",
                        error
                            ? "border-[var(--app-danger)] focus:ring-[var(--app-danger)]/30"
                            : "border-[var(--app-border)] focus:border-[var(--app-accent)] focus:ring-[var(--app-accent)]/20",
                        leading ? "pl-9" : "pl-3",
                        trailing ? "pr-9" : "pr-3",
                        className,
                    )}
                    {...props}
                />
                {trailing && (
                    <span className="absolute right-3 text-[var(--app-text-muted)]">
                        {trailing}
                    </span>
                )}
            </div>
        );
    },
);

/* ── PasswordInput ─────────────────────────────────────────── */
type PasswordInputProps = Omit<InputProps, "type" | "trailing">;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    function PasswordInput(props, ref) {
        const [visible, setVisible] = useState(false);
        return (
            <Input
                ref={ref}
                {...props}
                type={visible ? "text" : "password"}
                trailing={
                    <button
                        type="button"
                        aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        onClick={() => setVisible((v) => !v)}
                        className="pointer-events-auto text-[var(--app-text-muted)] transition hover:text-[var(--app-text-secondary)]"
                    >
                        {visible ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                }
            />
        );
    },
);

/* ── Textarea ──────────────────────────────────────────────── */
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    error?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    function Textarea({ error, className, ...props }, ref) {
        return (
            <textarea
                ref={ref}
                className={cn(
                    "min-h-[80px] w-full resize-y rounded-lg border px-3 py-2 text-sm transition",
                    "bg-[var(--app-surface)] text-[var(--app-text)]",
                    "placeholder:text-[var(--app-text-muted)]",
                    "focus:outline-none focus:ring-2",
                    error
                        ? "border-[var(--app-danger)] focus:ring-[var(--app-danger)]/30"
                        : "border-[var(--app-border)] focus:border-[var(--app-accent)] focus:ring-[var(--app-accent)]/20",
                    className,
                )}
                {...props}
            />
        );
    },
);
