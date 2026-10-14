import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { portalApi } from "@/api/portal.api";
import { Button, Field, Input, PasswordInput } from "@/components/ui";
import { ApiError, getErrorMessage } from "@/lib/errors";
import { AuthShell } from "./authShell";

const schema = z.object({
    name: z.string().min(1, "Vui lòng nhập họ tên").max(100),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(8, "Ít nhất 8 ký tự"),
    confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Mật khẩu không khớp", path: ["confirm"] });
type FV = z.infer<typeof schema>;

export default function Register() {
    const navigate = useNavigate();
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FV>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: FV) => {
        try {
            const res = await portalApi.auth.register({ name: data.name, email: data.email, password: data.password });
            const devQ = import.meta.env.DEV && res.devToken ? `&devToken=${encodeURIComponent(res.devToken)}` : "";
            navigate(`/verify-email?email=${encodeURIComponent(data.email)}${devQ}`);
        } catch (err) {
            if (err instanceof ApiError && err.code === "EMAIL_TAKEN") {
                setError("email", { message: "Email này đã được đăng ký." });
            } else {
                setError("root", { message: getErrorMessage(err) });
            }
        }
    };

    return (
        <AuthShell title="Tạo tài khoản" subtitle="Bắt đầu tạo video AI chuyên nghiệp." footer={<>Đã có tài khoản? <Link to="/login" className="font-semibold text-[var(--app-accent)] hover:opacity-80">Đăng nhập</Link></>}>
            {errors.root?.message && <div className="mb-4 rounded-xl border border-app-danger/30 bg-app-danger-soft px-4 py-3 text-sm text-app-danger">{errors.root.message}</div>}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <Field label="Họ và tên" error={errors.name?.message} required>
                    <Input {...register("name")} autoComplete="name" aria-invalid={!!errors.name} placeholder="Nhập họ và tên" disabled={isSubmitting} />
                </Field>
                <Field label="Email" error={errors.email?.message} required>
                    <Input {...register("email")} type="email" autoComplete="email" aria-invalid={!!errors.email} placeholder="Nhập email" disabled={isSubmitting} />
                </Field>
                <Field label="Mật khẩu" error={errors.password?.message} required hint="Tối thiểu 8 ký tự">
                    <PasswordInput {...register("password")} autoComplete="new-password" aria-invalid={!!errors.password} placeholder="Nhập mật khẩu" disabled={isSubmitting} />
                </Field>
                <Field label="Xác nhận mật khẩu" error={errors.confirm?.message} required>
                    <PasswordInput {...register("confirm")} autoComplete="new-password" aria-invalid={!!errors.confirm} placeholder="Nhập lại mật khẩu" disabled={isSubmitting} />
                </Field>
                <Button type="submit" fullWidth loading={isSubmitting}>Tạo tài khoản</Button>
            </form>
        </AuthShell>
    );
}