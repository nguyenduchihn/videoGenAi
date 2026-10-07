import {
    ArrowRight,
    Check,
    ChevronRight,
    Clapperboard,
    Image as ImageIcon,
    Menu,
    Mic,
    Play,
    Sparkles,
    WandSparkles,
    X,
    Zap,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const goToLogin = () => {
        navigate("/login");
    };

    const goToRegister = () => {
        navigate("/register");
    };

    const scrollToSection = (id: string) => {
        setMobileMenuOpen(false);

        const element = document.getElementById(id);

        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#080B12] text-white">
            <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080B12]/90 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">

                    <button
                        type="button"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="flex items-center gap-2.5"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>

                        <span className="text-base font-semibold tracking-tight">
                            VideoGen <span className="text-violet-400">AI</span>
                        </span>
                    </button>


                    <nav className="hidden items-center gap-8 lg:flex">
                        <button
                            type="button"
                            onClick={() => scrollToSection("product")}
                            className="text-sm text-gray-400 transition hover:text-white"
                        >
                            Sản phẩm
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollToSection("how-it-works")}
                            className="text-sm text-gray-400 transition hover:text-white"
                        >
                            Cách hoạt động
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollToSection("use-cases")}
                            className="text-sm text-gray-400 transition hover:text-white"
                        >
                            Ứng dụng
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollToSection("pricing")}
                            className="text-sm text-gray-400 transition hover:text-white"
                        >
                            Bảng giá
                        </button>
                    </nav>

                    <div className="hidden items-center gap-2 sm:flex">
                        <button
                            type="button"
                            onClick={goToLogin}
                            className="px-3 py-2 text-sm font-medium text-gray-300 transition hover:text-white"
                        >
                            Đăng nhập
                        </button>

                        <button
                            type="button"
                            onClick={goToRegister}
                            className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-gray-200 transition hover:border-white/15 hover:bg-white/[0.08]"
                        >
                            Đăng ký
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-300 transition hover:bg-white/5 sm:hidden"
                        aria-label="Mở menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="border-t border-white/[0.06] bg-[#080B12] px-5 py-5 sm:hidden">
                        <div className="flex flex-col gap-1">
                            <button
                                type="button"
                                onClick={() => scrollToSection("product")}
                                className="rounded-lg px-4 py-3 text-left text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                            >
                                Sản phẩm
                            </button>

                            <button
                                type="button"
                                onClick={() => scrollToSection("how-it-works")}
                                className="rounded-lg px-4 py-3 text-left text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                            >
                                Cách hoạt động
                            </button>

                            <button
                                type="button"
                                onClick={() => scrollToSection("use-cases")}
                                className="rounded-lg px-4 py-3 text-left text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                            >
                                Ứng dụng
                            </button>

                            <button
                                type="button"
                                onClick={() => scrollToSection("pricing")}
                                className="rounded-lg px-4 py-3 text-left text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                            >
                                Bảng giá
                            </button>

                            <div className="my-3 h-px bg-white/[0.06]" />

                            <button
                                type="button"
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    goToLogin();
                                }}
                                className="rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white"
                            >
                                Đăng nhập
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    goToRegister();
                                }}
                                className="mt-1 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm font-medium text-gray-200 transition hover:bg-white/[0.08]"
                            >
                                Đăng ký
                            </button>
                        </div>
                    </div>
                )}
            </header>

            <section className="relative overflow-hidden">

                <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />

                <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-20 lg:px-8 lg:pb-32 lg:pt-28">
                    <div className="mx-auto max-w-4xl text-center">

                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-3.5 py-1.5 text-xs font-medium text-violet-300">
                            <Sparkles className="h-3.5 w-3.5" />
                            AI Creative Workspace
                        </div>


                        <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-7xl">
                            Biến ý tưởng thành{" "}
                            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                video chuyên nghiệp.
                            </span>
                        </h1>

                        <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
                            VideoGen AI giúp bạn biến prompt, kịch bản, hình ảnh và
                            giọng nói thành những video hoàn chỉnh bằng AI — nhanh
                            chóng, trực quan và dễ dàng.
                        </p>

                        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={goToRegister}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-gray-950 transition hover:bg-gray-100 sm:w-auto"
                            >
                                Đăng ký ngay
                                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                            </button>

                            <button
                                type="button"
                                onClick={() => scrollToSection("how-it-works")}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-gray-200 transition hover:bg-white/[0.07] sm:w-auto"
                            >
                                <Play className="h-4 w-4" />
                                Xem cách hoạt động
                            </button>
                        </div>
                    </div>

                    <div className="relative mx-auto mt-16 max-w-6xl lg:mt-20">
                        <div className="pointer-events-none absolute -inset-10 rounded-[32px] bg-violet-600/10 blur-3xl" />

                        <div className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#10131C] shadow-2xl shadow-black/40">

                            <div className="flex h-11 items-center border-b border-white/[0.06] px-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                                </div>

                                <div className="mx-auto hidden rounded-md border border-white/[0.06] bg-white/[0.025] px-5 py-1 text-[10px] text-gray-500 sm:block">
                                    app.videogen.ai
                                </div>
                            </div>

                            <div className="grid min-h-[420px] grid-cols-1 md:grid-cols-[180px_1fr]">

                                <div className="hidden border-r border-white/[0.06] bg-[#0C0F17] p-4 md:block">
                                    <div className="mb-6 flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-500/15">
                                            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                                        </div>

                                        <span className="text-xs font-semibold">
                                            VideoGen AI
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        {[
                                            "Tổng quan",
                                            "Dự án",
                                            "Trình tạo AI",
                                            "Phương tiện",
                                        ].map((item, index) => (
                                            <div
                                                key={item}
                                                className={`rounded-lg px-3 py-2 text-[11px] ${index === 2
                                                    ? "bg-violet-500/10 text-violet-300"
                                                    : "text-gray-500"
                                                    }`}
                                            >
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>


                                <div className="p-5 sm:p-7">
                                    <div className="mb-6 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.18em] text-violet-400">
                                                AI Video Generator
                                            </p>

                                            <h3 className="mt-1 text-lg font-semibold">
                                                Tạo video mới
                                            </h3>
                                        </div>

                                        <div className="hidden rounded-lg border border-white/[0.07] px-3 py-2 text-[10px] text-gray-500 sm:block">
                                            16:9
                                        </div>
                                    </div>

                                    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">

                                        <div className="rounded-xl border border-white/[0.07] bg-[#0B0E15] p-4">
                                            <div className="mb-3 flex items-center gap-2">
                                                <WandSparkles className="h-4 w-4 text-violet-400" />
                                                <span className="text-xs font-medium text-gray-300">
                                                    Bạn muốn tạo video gì?
                                                </span>
                                            </div>

                                            <div className="min-h-[150px] rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                                                <p className="text-xs leading-6 text-gray-500">
                                                    Tạo video quảng cáo thời trang nam,
                                                    phong cách hiện đại, ánh sáng studio,
                                                    chuyển cảnh mượt và hình ảnh cao cấp...
                                                </p>
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <span className="rounded-md border border-white/[0.06] bg-white/[0.025] px-2.5 py-1 text-[10px] text-gray-500">
                                                    Video quảng cáo
                                                </span>

                                                <span className="rounded-md border border-white/[0.06] bg-white/[0.025] px-2.5 py-1 text-[10px] text-gray-500">
                                                    Social Media
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={goToRegister}
                                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white"
                                            >
                                                <Sparkles className="h-3.5 w-3.5" />
                                                Tạo video
                                            </button>
                                        </div>


                                        <div className="rounded-xl border border-white/[0.07] bg-[#0B0E15] p-3">
                                            <div className="mb-3 flex items-center justify-between">
                                                <span className="text-[10px] font-medium text-gray-400">
                                                    Preview
                                                </span>

                                                <span className="text-[9px] text-gray-600">
                                                    00:12
                                                </span>
                                            </div>

                                            <div className="relative aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-violet-900/40 via-indigo-900/20 to-gray-900">
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.35),transparent_40%)]" />

                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur">
                                                        <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3 space-y-2">
                                                <div className="h-1.5 rounded-full bg-white/[0.06]">
                                                    <div className="h-full w-[42%] rounded-full bg-violet-500" />
                                                </div>

                                                <div className="flex justify-between text-[9px] text-gray-600">
                                                    <span>00:00</span>
                                                    <span>00:12</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section
                id="product"
                className="border-t border-white/[0.06] bg-[#0B0E15]"
            >
                <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-28">
                    <div className="max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                            AI Capabilities
                        </p>

                        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                            Một workspace.
                            <br />
                            Mọi cách tạo video.
                        </h2>

                        <p className="mt-5 text-sm leading-6 text-gray-400 sm:text-base">
                            Từ một ý tưởng đơn giản đến một video hoàn chỉnh,
                            VideoGen AI hỗ trợ nhiều cách bắt đầu khác nhau.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <CapabilityCard
                            icon={<WandSparkles className="h-5 w-5" />}
                            title="Prompt → Video"
                            description="Mô tả ý tưởng và để AI xây dựng video theo yêu cầu."
                        />

                        <CapabilityCard
                            icon={<Clapperboard className="h-5 w-5" />}
                            title="Script → Video"
                            description="Biến kịch bản thành nội dung video có cấu trúc."
                        />

                        <CapabilityCard
                            icon={<ImageIcon className="h-5 w-5" />}
                            title="Image → Video"
                            description="Biến hình ảnh tĩnh thành những chuyển động sống động."
                        />

                        <CapabilityCard
                            icon={<Mic className="h-5 w-5" />}
                            title="Voice → Video"
                            description="Kết hợp giọng nói với hình ảnh để tạo video."
                        />
                    </div>
                </div>
            </section>

            <section
                id="how-it-works"
                className="border-t border-white/[0.06] bg-[#080B12]"
            >
                <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-28">
                    <div className="text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                            Workflow
                        </p>

                        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                            Từ ý tưởng đến video chỉ trong vài bước
                        </h2>

                        <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
                            Quy trình được thiết kế để bạn tập trung vào nội dung
                            thay vì phải xử lý những thao tác phức tạp.
                        </p>
                    </div>

                    <div className="relative mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                        <div className="absolute left-[12%] right-[12%] top-8 hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent lg:block" />

                        <StepCard
                            number="01"
                            title="Mô tả ý tưởng"
                            description="Cho AI biết video bạn muốn tạo và phong cách mong muốn."
                        />

                        <StepCard
                            number="02"
                            title="AI xây dựng nội dung"
                            description="AI phân tích yêu cầu và tạo cấu trúc nội dung phù hợp."
                        />

                        <StepCard
                            number="03"
                            title="Tinh chỉnh"
                            description="Chỉnh sửa nội dung, hình ảnh, giọng nói và phong cách."
                        />

                        <StepCard
                            number="04"
                            title="Xuất video"
                            description="Hoàn thiện video và xuất sản phẩm theo nhu cầu."
                        />
                    </div>
                </div>
            </section>

            <section
                id="use-cases"
                className="border-t border-white/[0.06] bg-[#0B0E15]"
            >
                <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-28">
                    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                                Use Cases
                            </p>

                            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                                Tạo video cho mọi nhu cầu
                            </h2>
                        </div>

                        <p className="max-w-lg text-sm leading-6 text-gray-400">
                            Từ nội dung marketing đến social media, sản phẩm và
                            giáo dục — một workspace cho nhiều mục đích khác nhau.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-4 md:grid-cols-2">
                        <UseCaseCard
                            number="01"
                            title="Marketing"
                            description="Tạo video quảng cáo, campaign và nội dung thương hiệu."
                        />

                        <UseCaseCard
                            number="02"
                            title="Social Media"
                            description="Tạo nội dung cho TikTok, Reels, Shorts và các nền tảng xã hội."
                        />

                        <UseCaseCard
                            number="03"
                            title="Sản phẩm"
                            description="Giới thiệu sản phẩm bằng video trực quan và chuyên nghiệp."
                        />

                        <UseCaseCard
                            number="04"
                            title="Giáo dục"
                            description="Xây dựng video bài giảng, hướng dẫn và nội dung đào tạo."
                        />
                    </div>
                </div>
            </section>

            <section className="border-t border-white/[0.06] bg-[#080B12]">
                <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-28">
                    <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                                Creative Workspace
                            </p>

                            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                                Mọi công cụ cần thiết,
                                <br />
                                trong một nơi.
                            </h2>

                            <p className="mt-5 max-w-lg text-sm leading-6 text-gray-400 sm:text-base">
                                Không cần chuyển qua nhiều công cụ. Từ ý tưởng,
                                nội dung, tài nguyên cho đến video cuối cùng đều
                                được quản lý trong cùng một workspace.
                            </p>

                            <div className="mt-8 space-y-4">
                                {[
                                    "Quản lý dự án tập trung",
                                    "AI hỗ trợ xuyên suốt quy trình",
                                    "Không gian làm việc trực quan",
                                    "Dễ dàng mở rộng workflow",
                                ].map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/10">
                                            <Check className="h-3 w-3 text-violet-400" />
                                        </div>

                                        <span className="text-sm text-gray-300">
                                            {item}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="pointer-events-none absolute -inset-6 rounded-[32px] bg-indigo-600/10 blur-3xl" />

                            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#10131C] shadow-2xl shadow-black/40">
                                <div className="flex h-10 items-center border-b border-white/[0.06] px-4">
                                    <div className="flex gap-1.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                                        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                                        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-[150px_1fr]">
                                    <div className="border-r border-white/[0.06] bg-[#0C0F17] p-3">
                                        <div className="mb-5 h-6 w-24 rounded bg-white/[0.04]" />

                                        <div className="space-y-2">
                                            <div className="h-7 rounded bg-violet-500/10" />
                                            <div className="h-7 rounded bg-white/[0.025]" />
                                            <div className="h-7 rounded bg-white/[0.025]" />
                                            <div className="h-7 rounded bg-white/[0.025]" />
                                        </div>

                                        <div className="mt-8 space-y-2">
                                            <div className="h-2 w-16 rounded bg-white/[0.05]" />
                                            <div className="h-2 w-24 rounded bg-white/[0.04]" />
                                            <div className="h-2 w-20 rounded bg-white/[0.04]" />
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="h-2 w-16 rounded bg-violet-400/20" />
                                                <div className="mt-2 h-4 w-32 rounded bg-white/[0.08]" />
                                            </div>

                                            <div className="h-7 w-20 rounded-lg bg-white/[0.04]" />
                                        </div>

                                        <div className="mt-5 aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-violet-900/40 via-indigo-900/20 to-gray-900">
                                            <div className="flex h-full items-center justify-center">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/30">
                                                    <Play className="h-4 w-4 fill-white text-white" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex gap-3">
                                            <div className="h-10 flex-1 rounded-lg bg-white/[0.035]" />
                                            <div className="h-10 w-24 rounded-lg bg-violet-500/20" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section
                id="pricing"
                className="border-t border-white/[0.06] bg-[#0B0E15]"
            >
                <div className="mx-auto max-w-4xl px-5 py-24 text-center lg:px-8 lg:py-28">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                        <Zap className="h-5 w-5 text-violet-400" />
                    </div>

                    <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-5xl">
                        Sẵn sàng tạo video?
                    </h2>

                    <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
                        Bắt đầu với VideoGen AI và biến những ý tưởng của bạn
                        thành nội dung video chuyên nghiệp.
                    </p>

                    <button
                        type="button"
                        onClick={goToRegister}
                        className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-gray-950 transition hover:bg-gray-100"
                    >
                        Đăng ký ngay
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </button>
                </div>
            </section>

            <footer className="border-t border-white/[0.06] bg-[#080B12]">
                <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
                    <div className="flex flex-col justify-between gap-8 md:flex-row">
                        <div className="max-w-sm">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                                    <Sparkles className="h-4 w-4 text-white" />
                                </div>

                                <span className="text-sm font-semibold">
                                    VideoGen <span className="text-violet-400">AI</span>
                                </span>
                            </div>

                            <p className="mt-4 text-xs leading-5 text-gray-500">
                                AI Creative Workspace giúp bạn biến ý tưởng
                                thành những video chuyên nghiệp.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-14 gap-y-8 sm:grid-cols-3">
                            <FooterColumn
                                title="Sản phẩm"
                                items={[
                                    "AI Video Generator",
                                    "Projects",
                                    "Media",
                                ]}
                            />

                            <FooterColumn
                                title="Tài nguyên"
                                items={[
                                    "Cách hoạt động",
                                    "Bảng giá",
                                    "Hỗ trợ",
                                ]}
                            />

                            <FooterColumn
                                title="Tài khoản"
                                items={[
                                    "Đăng nhập",
                                    "Đăng ký",
                                ]}
                            />
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-gray-600 sm:flex-row">
                        <span>© 2026 VideoGen AI. All rights reserved.</span>

                        <div className="flex gap-5">
                            <span className="cursor-pointer hover:text-gray-400">
                                Chính sách bảo mật
                            </span>

                            <span className="cursor-pointer hover:text-gray-400">
                                Điều khoản sử dụng
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}


interface CapabilityCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

function CapabilityCard({
    icon,
    title,
    description,
}: CapabilityCardProps) {
    return (
        <div className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/20 hover:bg-white/[0.035]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 transition group-hover:bg-violet-500/15">
                {icon}
            </div>

            <h3 className="mt-5 text-sm font-semibold text-white">
                {title}
            </h3>

            <p className="mt-2 text-xs leading-5 text-gray-500">
                {description}
            </p>

            <div className="mt-5 flex items-center gap-1 text-[11px] font-medium text-gray-600 transition group-hover:text-violet-400">
                Khám phá
                <ChevronRight className="h-3 w-3" />
            </div>
        </div>
    );
}

interface StepCardProps {
    number: string;
    title: string;
    description: string;
}

function StepCard({
    number,
    title,
    description,
}: StepCardProps) {
    return (
        <div className="relative rounded-2xl border border-white/[0.07] bg-[#0B0E15] p-5">
            <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-xs font-semibold text-violet-400">
                {number}
            </div>

            <h3 className="mt-6 text-sm font-semibold">
                {title}
            </h3>

            <p className="mt-2 text-xs leading-5 text-gray-500">
                {description}
            </p>
        </div>
    );
}

interface UseCaseCardProps {
    number: string;
    title: string;
    description: string;
}

function UseCaseCard({
    number,
    title,
    description,
}: UseCaseCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#10131C] p-6 transition duration-300 hover:border-violet-400/20">
            <div className="absolute right-5 top-5 text-xs font-medium text-gray-700">
                {number}
            </div>

            <div className="max-w-md">
                <h3 className="text-lg font-semibold transition group-hover:text-violet-300">
                    {title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                    {description}
                </p>

                <div className="mt-6 flex items-center gap-1 text-xs text-gray-600 transition group-hover:text-violet-400">
                    Tìm hiểu thêm
                    <ArrowRight className="h-3.5 w-3.5" />
                </div>
            </div>
        </div>
    );
}

interface FooterColumnProps {
    title: string;
    items: string[];
}

function FooterColumn({
    title,
    items,
}: FooterColumnProps) {
    return (
        <div>
            <h4 className="text-xs font-semibold text-gray-300">
                {title}
            </h4>

            <div className="mt-4 space-y-3">
                {items.map((item) => (
                    <button
                        key={item}
                        type="button"
                        className="block text-left text-xs text-gray-600 transition hover:text-gray-300"
                    >
                        {item}
                    </button>
                ))}
            </div>
        </div>
    );
}