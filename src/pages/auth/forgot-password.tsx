import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { portalApi } from "@/api/portal.api";
import { Button, Field, Input } from "@/components/ui";
import { getErrorMessage } from "@/lib/errors";
import { AuthShell } from "./authShell";

const schema = z.object({ email: z.string().email("Email không hợp lệ") });
type FV = z.infer<typeof schema>;

export default function ForgotPassword() {
    const [sent, setSent] = useState<{ email: string; devToken?: string | null } | null>(null);
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FV>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: FV) => {
        try {
            const res = await portalApi.auth.forgotPassword(data.email);
            setSent({ email: data.email, devToken: res.devToken });
        } catch (err) {
            setError("root", { message: getErrorMessage(err) });
        }
    };

    if (sent) return (
        <AuthShell title="Đã gửi!" subtitle={`Kiểm tra hộp thư ${sent.email} để đặt lại mật khẩu.`} footer={<Link to="/login" className="text-[var(--app-accent)]">← Đăng nhập</Link>}>
            {import.meta.env.DEV && sent.devToken && (
                <p className="text-center text-xs text-[var(--app-text-muted)]">
                    <Link to={`/reset-password?token=${sent.devToken}`} className="underline">Đặt lại ngay (dev)</Link>
                </p>
            )}
        </AuthShell>
    );

    return (
        <AuthShell title="Quên mật khẩu?" subtitle="Nhập email để nhận link đặt lại mật khẩu." footer={<Link to="/login" className="text-[var(--app-accent)]">← Đăng nhập</Link>}>
            {errors.root?.message && <div className="mb-4 rounded-xl border border-app-danger/30 bg-app-danger-soft px-4 py-3 text-sm text-app-danger">{errors.root.message}</div>}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <Field label="Email" error={errors.email?.message} required>
                    <Input {...register("email")} type="email" autoComplete="email" aria-invalid={!!errors.email} placeholder="Nhập email" disabled={isSubmitting} />
                </Field>
                <Button type="submit" fullWidth loading={isSubmitting}>Gửi link đặt lại mật khẩu</Button>
            </form>
        </AuthShell>
    );
}
