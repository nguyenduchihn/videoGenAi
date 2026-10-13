import {
    ArrowLeft,
    ArrowRight,
    Check,
    ChevronDown,
    Clapperboard,
    Globe,
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

const showcases = [
    {
        title: "Fantasy worlds, brought to life",
        prompt: "Epic fantasy battle, emerald mist, cinematic lighting",
        type: "AI VIDEO",
        style: "from-emerald-950 via-green-800 to-slate-950",
        accent: "bg-emerald-300/20",
        icon: "✦",
    },
    {
        title: "Make every story feel real",
        prompt: "Ocean light, dreamlike portrait, soft movement",
        type: "IMAGE TO VIDEO",
        style: "from-sky-300 via-cyan-700 to-blue-950",
        accent: "bg-cyan-200/25",
        icon: "◈",
    },
    {
        title: "Create your next big idea",
        prompt: "Neon city at night, cinematic camera movement",
        type: "TEXT TO VIDEO",
        style: "from-violet-950 via-indigo-800 to-slate-950",
        accent: "bg-violet-300/20",
        icon: "✧",
    },
];

export default function Home() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeShowcase, setActiveShowcase] = useState(0);
    const [prompt, setPrompt] = useState("");

    const goToLogin = () => navigate("/login");
    const goToRegister = () => navigate("/register");

    const scrollToSection = (id: string) => {
        setMobileMenuOpen(false);
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    const current = showcases[activeShowcase];

    return (
        <main className="min-h-screen overflow-x-hidden bg-white text-slate-950">
            <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
                <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
                    <button
                        type="button"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="flex items-center gap-2.5"
                        aria-label="VideoGen AI trang chủ"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                            <Play className="ml-0.5 h-4 w-4 fill-white" />
                        </span>
                        <span className="text-lg font-bold tracking-tight">VideoGen <span className="text-blue-600">AI</span></span>
                    </button>

                    <nav className="hidden items-center gap-7 lg:flex">
                        <button onClick={() => scrollToSection("create")} className="flex items-center gap-1 text-sm font-medium text-slate-700 transition hover:text-blue-600">Sáng tạo <ChevronDown className="h-3.5 w-3.5" /></button>
                        <button onClick={() => scrollToSection("features")} className="flex items-center gap-1 text-sm font-medium text-slate-700 transition hover:text-blue-600">Tính năng <ChevronDown className="h-3.5 w-3.5" /></button>
                        <button onClick={() => scrollToSection("use-cases")} className="flex items-center gap-1 text-sm font-medium text-slate-700 transition hover:text-blue-600">Ứng dụng <ChevronDown className="h-3.5 w-3.5" /></button>
                        <button onClick={() => scrollToSection("how-it-works")} className="text-sm font-medium text-slate-700 transition hover:text-blue-600">Hướng dẫn</button>
                        <button onClick={() => scrollToSection("pricing")} className="text-sm font-medium text-slate-700 transition hover:text-blue-600">Bảng giá</button>
                    </nav>

                    <div className="hidden items-center gap-3 sm:flex">
                        <button type="button" aria-label="Ngôn ngữ" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50"><Globe className="h-4 w-4" /></button>
                        <button type="button" onClick={goToLogin} className="rounded-full px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">Đăng nhập</button>
                        <button type="button" onClick={goToRegister} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">Bắt đầu miễn phí</button>
                    </div>

                    <button type="button" onClick={() => setMobileMenuOpen((value) => !value)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 sm:hidden" aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}>
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="border-t border-slate-100 bg-white px-5 py-4 sm:hidden">
                        <div className="flex flex-col gap-1">
                            {[
                                ["Sáng tạo", "create"],
                                ["Tính năng", "features"],
                                ["Ứng dụng", "use-cases"],
                                ["Hướng dẫn", "how-it-works"],
                                ["Bảng giá", "pricing"],
                            ].map(([label, id]) => (
                                <button key={id} onClick={() => scrollToSection(id)} className="rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-700 hover:bg-blue-50">{label}</button>
                            ))}
                            <div className="my-2 border-t border-slate-100" />
                            <button onClick={() => { setMobileMenuOpen(false); goToLogin(); }} className="rounded-lg px-3 py-3 text-left text-sm font-semibold text-blue-700">Đăng nhập</button>
                            <button onClick={() => { setMobileMenuOpen(false); goToRegister(); }} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Bắt đầu miễn phí</button>
                        </div>
                    </div>
                )}
            </header>

            <section id="create" className="relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_12%_8%,rgba(191,219,254,0.45),transparent_35%),radial-gradient(ellipse_at_88%_18%,rgba(221,214,254,0.4),transparent_32%),linear-gradient(180deg,#f8fbff_0%,#ffffff_76%)]">
                <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
                <div className="mx-auto max-w-[1440px] px-5 pb-14 pt-16 sm:px-8 sm:pt-20 lg:px-12 lg:pb-20 lg:pt-24">
                    <div className="mx-auto max-w-5xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm shadow-blue-100/70">
                            <Sparkles className="h-4 w-4" /> Không gian sáng tạo AI tất cả trong một
                        </div>
                        <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[68px]">
                            Biến ý tưởng thành video.
                            <span className="block bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 bg-clip-text pb-2 text-transparent">Sáng tạo không giới hạn.</span>
                        </h1>
                        <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                            Tạo video bằng AI từ mô tả, hình ảnh và kịch bản. Từ ý tưởng đầu tiên đến nội dung sẵn sàng xuất bản — tất cả trong một workspace.
                        </p>
                    </div>
                    <div className="mx-auto mt-9 max-w-5xl rounded-[28px] border border-white bg-white p-4 shadow-[0_24px_80px_-35px_rgba(37,99,235,0.28)] ring-1 ring-slate-200/80 sm:p-6">
                        <label htmlFor="home-prompt" className="sr-only">Mô tả video muốn tạo</label>
                        <textarea
                            id="home-prompt"
                            value={prompt}
                            onChange={(event) => setPrompt(event.target.value)}
                            placeholder="Mô tả video bạn muốn tạo... Ví dụ: Một quảng cáo sản phẩm với ánh sáng studio, chuyển động camera điện ảnh và màu sắc hiện đại."
                            rows={3}
                            className="min-h-[100px] w-full resize-y border-0 bg-transparent px-1 py-1 text-base leading-7 text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0 sm:text-lg"
                        />
                        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
                            <div className="flex flex-wrap items-center gap-2">
                                <button type="button" onClick={goToRegister} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-blue-50 hover:text-blue-700"><ImageIcon className="h-4 w-4" /> Tải ảnh / video</button>
                                <span className="hidden text-xs text-slate-400 sm:inline">JPG, PNG, MP4</span>
                            </div>
                            <button type="button" onClick={goToRegister} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:ml-auto">
                                <Sparkles className="h-4 w-4" /> Tạo video miễn phí <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <p className="mt-4 text-center text-xs text-slate-500">Bắt đầu miễn phí · Không cần kinh nghiệm dựng video</p>

                    <div className="relative mx-auto mt-14 max-w-[1180px] sm:mt-16">
                        <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.8fr)_minmax(0,1fr)]">
                            <button type="button" onClick={() => setActiveShowcase((activeShowcase + showcases.length - 1) % showcases.length)} className="group hidden h-[250px] overflow-hidden rounded-[28px] border border-white/80 text-left shadow-xl shadow-slate-300/30 transition hover:-translate-y-1 lg:block" aria-label="Video trước">
                                <div className={`relative flex h-full items-end bg-gradient-to-br ${showcases[(activeShowcase + showcases.length - 1) % showcases.length].style} p-5`}>
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_30%)]" />
                                    <span className="relative text-sm font-semibold text-white">{showcases[(activeShowcase + showcases.length - 1) % showcases.length].title}</span>
                                </div>
                            </button>

                            <div className={`group relative min-h-[300px] overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-br ${current.style} p-5 shadow-[0_32px_80px_-35px_rgba(30,64,175,0.4)] sm:min-h-[420px] sm:p-8`}>
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_22%_20%,rgba(255,255,255,0.25),transparent_30%),radial-gradient(ellipse_at_75%_75%,rgba(96,165,250,0.2),transparent_40%)]" />
                                <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.5)_50%,transparent_65%)]" />
                                <div className="relative flex min-h-[260px] flex-col justify-between sm:min-h-[356px]">
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="rounded-full border border-white/25 bg-black/15 px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] text-white/90 backdrop-blur">{current.type}</span>
                                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-xl text-white backdrop-blur">{current.icon}</span>
                                    </div>
                                    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-8 text-center">
                                        <div className={`mb-5 flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/25 ${current.accent} text-white shadow-2xl backdrop-blur-md sm:h-24 sm:w-24`}><Clapperboard className="h-9 w-9 sm:h-11 sm:w-11" /></div>
                                        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">{current.title}</h2>
                                        <p className="mt-3 max-w-md text-sm leading-6 text-white/75 sm:text-base">{current.prompt}</p>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-full border border-white/30 bg-white/75 p-2 pl-4 text-slate-900 shadow-lg backdrop-blur-xl">
                                        <Sparkles className="h-4 w-4 shrink-0 text-blue-700" />
                                        <span className="min-w-0 flex-1 truncate text-xs font-medium sm:text-sm">{current.prompt}</span>
                                        <button type="button" onClick={goToRegister} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 sm:px-5 sm:text-sm"><Sparkles className="h-3.5 w-3.5" /> Tạo</button>
                                    </div>
                                </div>
                            </div>

                            <button type="button" onClick={() => setActiveShowcase((activeShowcase + 1) % showcases.length)} className="group hidden h-[250px] overflow-hidden rounded-[28px] border border-white/80 text-left shadow-xl shadow-slate-300/30 transition hover:-translate-y-1 lg:block" aria-label="Video tiếp theo">
                                <div className={`relative flex h-full items-end bg-gradient-to-br ${showcases[(activeShowcase + 1) % showcases.length].style} p-5`}>
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_30%)]" />
                                    <span className="relative text-sm font-semibold text-white">{showcases[(activeShowcase + 1) % showcases.length].title}</span>
                                </div>
                            </button>
                        </div>
                        <div className="mt-5 flex items-center justify-center gap-3">
                            <button type="button" onClick={() => setActiveShowcase((activeShowcase + showcases.length - 1) % showcases.length)} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700" aria-label="Slide trước"><ArrowLeft className="h-4 w-4" /></button>
                            {showcases.map((item, index) => <button key={item.title} type="button" onClick={() => setActiveShowcase(index)} className={`h-2 rounded-full transition-all ${index === activeShowcase ? "w-7 bg-blue-600" : "w-2 bg-slate-300 hover:bg-slate-400"}`} aria-label={`Chọn mẫu ${index + 1}`} />)}
                            <button type="button" onClick={() => setActiveShowcase((activeShowcase + 1) % showcases.length)} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700" aria-label="Slide tiếp theo"><ArrowRight className="h-4 w-4" /></button>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="border-t border-slate-100 bg-white py-20 sm:py-24">
                <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Một workspace · Nhiều khả năng</p>
                        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Mọi công cụ sáng tạo, trong một nơi</h2>
                        <p className="mt-4 text-base leading-7 text-slate-600">Tạo nội dung, thử nghiệm phong cách và phát triển ý tưởng mà không cần chuyển qua nhiều công cụ.</p>
                    </div>
                    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <FeatureCard icon={<WandSparkles className="h-5 w-5" />} title="Text to Video" description="Biến mô tả thành video với phong cách và chuyển động theo ý tưởng." />
                        <FeatureCard icon={<ImageIcon className="h-5 w-5" />} title="Image to Video" description="Thêm chuyển động cho hình ảnh tĩnh và tạo câu chuyện trực quan." />
                        <FeatureCard icon={<Mic className="h-5 w-5" />} title="Voice & Script" description="Kết hợp lời thoại, kịch bản và hình ảnh thành nội dung mạch lạc." />
                        <FeatureCard icon={<Clapperboard className="h-5 w-5" />} title="Quản lý dự án" description="Tổ chức ý tưởng, kết quả và nội dung sáng tạo trong một nơi." />
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="bg-slate-50 py-20 sm:py-24">
                <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
                    <div className="text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Quy trình đơn giản</p>
                        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Từ ý tưởng đến video chỉ trong vài bước</h2>
                    </div>
                    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StepCard number="01" title="Mô tả ý tưởng" description="Viết mô tả hoặc cung cấp hình ảnh làm điểm bắt đầu." />
                        <StepCard number="02" title="Chọn phong cách" description="Xác định cảm xúc, khung hình và phong cách mong muốn." />
                        <StepCard number="03" title="Tạo với AI" description="Để AI tạo nội dung video từ ý tưởng của bạn." />
                        <StepCard number="04" title="Hoàn thiện & chia sẻ" description="Xem lại kết quả và tiếp tục hoàn thiện dự án." />
                    </div>
                </div>
            </section>

            <section id="use-cases" className="bg-white py-20 sm:py-24">
                <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Ứng dụng</p><h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Sáng tạo cho mọi nhu cầu</h2></div>
                        <p className="max-w-xl text-sm leading-6 text-slate-600 sm:text-base">Từ nội dung marketing, video sản phẩm đến mạng xã hội và giáo dục — bắt đầu từ một ý tưởng của bạn.</p>
                    </div>
                    <div className="mt-10 grid gap-4 md:grid-cols-2">
                        <UseCaseCard number="01" title="Marketing & thương hiệu" description="Tạo video quảng cáo, giới thiệu chiến dịch và nội dung thương hiệu." />
                        <UseCaseCard number="02" title="Social media" description="Phát triển ý tưởng cho TikTok, Reels, Shorts và các nền tảng xã hội." />
                        <UseCaseCard number="03" title="Video sản phẩm" description="Giới thiệu sản phẩm bằng hình ảnh chuyển động thu hút và nhất quán." />
                        <UseCaseCard number="04" title="Giáo dục & hướng dẫn" description="Biến kiến thức và quy trình thành nội dung trực quan, dễ theo dõi." />
                    </div>
                </div>
            </section>

            <section id="pricing" className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
                <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-14 text-center shadow-2xl shadow-blue-700/20 sm:px-12 sm:py-16">
                    <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
                    <div className="relative mx-auto max-w-2xl">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10"><Zap className="h-5 w-5 text-white" /></div>
                        <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-5xl">Ý tưởng tiếp theo của bạn bắt đầu ở đây.</h2>
                        <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">Bắt đầu sáng tạo cùng VideoGen AI và biến ý tưởng thành nội dung video của riêng bạn.</p>
                        <button type="button" onClick={goToRegister} className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50">Bắt đầu miễn phí <ArrowRight className="h-4 w-4" /></button>
                    </div>
                </div>
            </section>

            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
                    <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2.5 self-start">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white"><Play className="ml-0.5 h-3.5 w-3.5 fill-white" /></span>
                        <span className="text-sm font-bold text-slate-900">VideoGen <span className="text-blue-600">AI</span></span>
                    </button>
                    <p className="text-xs text-slate-500">© 2026 VideoGen AI. Không gian sáng tạo video bằng AI.</p>
                    <div className="flex gap-5 text-xs text-slate-500"><button type="button" className="transition hover:text-blue-700">Chính sách bảo mật</button><button type="button" className="transition hover:text-blue-700">Điều khoản sử dụng</button></div>
                </div>
            </footer>
        </main>
    );
}

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <article className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">{icon}</div>
            <h3 className="mt-5 text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-blue-700">Khám phá <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></div>
        </article>
    );
}

interface StepCardProps {
    number: string;
    title: string;
    description: string;
}

function StepCard({ number, title, description }: StepCardProps) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.02]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700">{number}</span>
            <h3 className="mt-5 text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            <div className="mt-5 flex items-center gap-2 text-xs font-medium text-slate-400"><Check className="h-4 w-4 text-blue-600" /> Dễ dàng bắt đầu</div>
        </article>
    );
}

interface UseCaseCardProps {
    number: string;
    title: string;
    description: string;
}

function UseCaseCard({ number, title, description }: UseCaseCardProps) {
    return (
        <article className="group flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:bg-blue-50/40 sm:p-7">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-500 transition group-hover:bg-blue-600 group-hover:text-white">{number}</span>
            <div><h3 className="text-base font-semibold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-700">Tìm hiểu thêm <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span></div>
        </article>
    );
}
