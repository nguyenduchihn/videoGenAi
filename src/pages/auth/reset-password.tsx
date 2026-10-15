import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { portalApi } from "@/api/portal.api";
import { Button, ErrorPanel, Field, PasswordInput } from "@/components/ui";
import { useFeedback } from "@/hooks/useFeedback";
import { ApiError, getErrorMessage } from "@/lib/errors";
import { AuthShell } from "./authShell";

const TOKEN_CODES = new Set(["TOKEN_INVALID", "TOKEN_EXPIRED", "TOKEN_USED"]);
const schema = z.object({
    newPassword: z.string().min(8, "Ít nhất 8 ký tự"),
    confirm: z.string(),
}).refine((d) => d.newPassword === d.confirm, { message: "Mật khẩu không khớp", path: ["confirm"] });
type FV = z.infer<typeof schema>;

export default function ResetPassword() {
    const [params] = useSearchParams();
    const token = params.get("token") ?? "";
    const navigate = useNavigate();
    const { toast } = useFeedback();
    const [isTokenErr, setIsTokenErr] = useState(false);
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FV>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: FV) => {
        setIsTokenErr(false);
        try {
            await portalApi.auth.resetPassword(token, data.newPassword);
            toast.success("Mật khẩu đã được đặt lại.");
            navigate("/login", { replace: true });
        } catch (err) {
            const code = err instanceof ApiError ? err.code : null;
            if (code === "WEAK_PASSWORD") {
                setError("newPassword", { message: "Mật khẩu quá yếu." });
            } else {
                const isToken = !!(code && TOKEN_CODES.has(code));
                setIsTokenErr(isToken);
                setError("root", { message: isToken ? (code === "TOKEN_EXPIRED" ? "Liên kết đã hết hạn." : "Liên kết không hợp lệ.") : getErrorMessage(err) });
            }
        }
    };

    if (!token) return (
        <AuthShell title="Liên kết không hợp lệ" footer={<Link to="/forgot-password" className="text-[var(--app-accent)]">Yêu cầu link mới</Link>}>
            <ErrorPanel message="Không tìm thấy token đặt lại mật khẩu." />
        </AuthShell>
    );

    return (
        <AuthShell title="Đặt lại mật khẩu" subtitle="Nhập mật khẩu mới cho tài khoản của bạn." footer={<Link to="/login" className="text-[var(--app-accent)]">← Đăng nhập</Link>}>
            {errors.root?.message && (
                <div className="mb-4">
                    <ErrorPanel message={errors.root.message} />
                    {isTokenErr && <p className="mt-2 text-center text-sm"><Link to="/forgot-password" className="text-[var(--app-accent)] underline">Yêu cầu link mới</Link></p>}
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <Field label="Mật khẩu mới" error={errors.newPassword?.message} required hint="Tối thiểu 8 ký tự">
                    <PasswordInput {...register("newPassword")} autoComplete="new-password" aria-invalid={!!errors.newPassword} placeholder="Nhập mật khẩu mới" disabled={isSubmitting} />
                </Field>
                <Field label="Xác nhận mật khẩu" error={errors.confirm?.message} required>
                    <PasswordInput {...register("confirm")} autoComplete="new-password" aria-invalid={!!errors.confirm} placeholder="Nhập lại mật khẩu" disabled={isSubmitting} />
                </Field>
                <Button type="submit" fullWidth loading={isSubmitting}>Đặt lại mật khẩu</Button>
            </form>
        </AuthShell>
    );
}
