
import { useMemo, useState } from "react";
import {
    Search,
    Video,
    CreditCard,
    FolderKanban,
    UserRound,
    ChevronDown,
    Mail,
    ArrowUpRight,
    Sparkles,
    CircleHelp,
    MessageCircle,
} from "lucide-react";

const helpItems = [
    {
        title: "Tạo video AI",
        description: "Hướng dẫn tạo video và xử lý tác vụ.",
        icon: Video,
        questions: [
            {
                question: "Bắt đầu tạo video như thế nào?",
                answer:
                    "Chọn chế độ tạo video, nhập mô tả hoặc tải ảnh lên, kiểm tra thiết lập rồi bắt đầu tạo.",
            },
            {
                question: "Video tạo lâu hoặc bị lỗi thì sao?",
                answer:
                    "Kiểm tra trạng thái trong mục Dự án. Nếu tác vụ vẫn gặp lỗi, hãy gửi mã tác vụ và mô tả vấn đề cho đội ngũ hỗ trợ.",
            },
        ],
    },
    {
        title: "Credits & thanh toán",
        description: "Quản lý credits và gói dịch vụ.",
        icon: CreditCard,
        questions: [
            {
                question: "Xem số credits ở đâu?",
                answer:
                    "Mở trang tài khoản hoặc trang gói dịch vụ để kiểm tra thông tin credits hiện có.",
            },
            {
                question: "Thanh toán chưa được cập nhật?",
                answer:
                    "Kiểm tra lại trạng thái giao dịch. Nếu vấn đề chưa được giải quyết, hãy liên hệ hỗ trợ kèm thông tin giao dịch cần thiết.",
            },
        ],
    },
    {
        title: "Quản lý dự án",
        description: "Theo dõi tác vụ và kết quả video.",
        icon: FolderKanban,
        questions: [
            {
                question: "Tìm video đã tạo ở đâu?",
                answer:
                    "Mở mục Dự án để xem danh sách tác vụ và kết quả video đã tạo.",
            },
            {
                question: "Làm sao biết video đã tạo xong?",
                answer:
                    "Theo dõi trạng thái tác vụ trong danh sách dự án và mở tác vụ để xem kết quả khi hoàn tất.",
            },
        ],
    },
    {
        title: "Tài khoản",
        description: "Thông tin cá nhân và bảo mật.",
        icon: UserRound,
        questions: [
            {
                question: "Chỉnh sửa thông tin cá nhân ở đâu?",
                answer:
                    "Mở trang Hồ sơ hoặc Cài đặt để xem các tùy chọn tài khoản hiện có.",
            },
            {
                question: "Tôi cần làm gì khi gặp lỗi tài khoản?",
                answer:
                    "Kiểm tra thông tin đăng nhập và cài đặt bảo mật. Nếu chưa xử lý được, hãy liên hệ đội ngũ hỗ trợ.",
            },
        ],
    },
];

export default function Support() {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("Tất cả");
    const [openQuestion, setOpenQuestion] = useState<string | null>(null);
    const keyword = search.trim().toLocaleLowerCase("vi");

    const filteredItems = useMemo(() => {
        return helpItems
            .filter(
                (item) =>
                    activeCategory === "Tất cả" ||
                    item.title === activeCategory,
            )
            .map((item) => ({
                ...item,
                questions: item.questions.filter(
                    (q) =>
                        !keyword ||
                        item.title.toLocaleLowerCase("vi").includes(keyword) ||
                        item.description.toLocaleLowerCase("vi").includes(keyword) ||
                        q.question.toLocaleLowerCase("vi").includes(keyword) ||
                        q.answer.toLocaleLowerCase("vi").includes(keyword),
                ),
            }))
            .filter((item) => item.questions.length > 0);
    }, [activeCategory, keyword]);

    return (
        <main className="min-h-full bg-[var(--app-bg)] px-3 py-4 text-[var(--app-text)] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">

                <section className="relative overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)]">
                    <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[var(--app-accent)] opacity-10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-blue-500 opacity-[0.07] blur-3xl" />

                    <div className="relative px-4 py-6 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-1.5 text-xs font-medium text-[var(--app-accent)]">
                            <Sparkles className="h-3.5 w-3.5" />
                            VideoGen AI Support
                        </div>

                        <h1 className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-4xl lg:text-5xl lg:leading-tight">
                            Chúng tôi có thể
                            <span className="text-[var(--app-accent)]">
                                {" "}giúp gì cho bạn?
                            </span>
                        </h1>

                        <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--app-text-secondary)] sm:text-base">
                            Tìm hướng dẫn sử dụng, giải đáp thắc mắc và xử lý các vấn đề
                            khi sáng tạo video với AI.
                        </p>

                        <div className="mt-5 flex max-w-2xl items-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-3 transition focus-within:border-[var(--app-accent)] focus-within:ring-2 focus-within:ring-[var(--app-accent)]/15 sm:mt-7 sm:px-4 sm:py-3.5">
                            <Search className="h-5 w-5 shrink-0 text-[var(--app-text-muted)]" />

                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Bạn đang cần tìm điều gì?"
                                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--app-text-muted)]"
                                aria-label="Tìm kiếm nội dung hỗ trợ"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="text-xs text-[var(--app-text-secondary)] hover:text-[var(--app-text)]"
                                >
                                    Xóa
                                </button>
                            )}
                        </div>

                        <p className="mt-3 text-xs text-[var(--app-text-muted)]">
                            Gợi ý: tạo video, credits, tài khoản
                        </p>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight">
                                Bạn cần hỗ trợ về?
                            </h2>
                            <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
                                Chọn một chủ đề để tìm câu trả lời nhanh hơn.
                            </p>
                        </div>

                        <span className="text-xs text-[var(--app-text-muted)]">
                            {filteredItems.reduce(
                                (total, item) => total + item.questions.length,
                                0,
                            )} câu hỏi
                        </span>
                    </div>
                    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:hidden">
                        {["Tất cả", ...helpItems.map((item) => item.title)].map((category) => {
                            const selected = activeCategory === category;

                            return (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => {
                                        setActiveCategory(category);
                                        setOpenQuestion(null);
                                    }}
                                    className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition ${selected
                                        ? "border-[var(--app-accent)] bg-[var(--app-accent-soft)] text-[var(--app-accent)]"
                                        : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-secondary)]"
                                        }`}
                                >
                                    {category}
                                </button>
                            );
                        })}
                    </div>

                    <div className="hidden gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-4">
                        {helpItems.map((item) => {
                            const Icon = item.icon;
                            const selected = activeCategory === item.title;

                            return (
                                <button
                                    key={item.title}
                                    type="button"
                                    onClick={() => {
                                        setActiveCategory(selected ? "Tất cả" : item.title);
                                        setOpenQuestion(null);
                                    }}
                                    className={`group rounded-2xl border p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.03] ${selected
                                        ? "border-[var(--app-accent)] bg-[var(--app-accent-soft)]"
                                        : "border-[var(--app-border)] bg-[var(--app-surface)] hover:border-[var(--app-accent)]/50"
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div
                                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${selected
                                                ? "bg-[var(--app-surface)] text-[var(--app-accent)]"
                                                : "bg-[var(--app-accent-soft)] text-[var(--app-accent)]"
                                                }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>

                                        <ArrowUpRight className="h-4 w-4 text-[var(--app-text-muted)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--app-accent)]" />
                                    </div>

                                    <h3 className="mt-4 font-semibold">
                                        {item.title}
                                    </h3>

                                    <p className="mt-2 min-h-10 text-sm leading-5 text-[var(--app-text-secondary)]">
                                        {item.description}
                                    </p>

                                    <p className="mt-4 text-xs font-medium text-[var(--app-accent)]">
                                        {item.questions.length} bài hướng dẫn
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    {activeCategory !== "Tất cả" && (
                        <button
                            type="button"
                            onClick={() => setActiveCategory("Tất cả")}
                            className="text-sm text-[var(--app-accent)] hover:underline"
                        >
                            Xem tất cả chủ đề
                        </button>
                    )}
                </section>

                <section className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 sm:p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                                <CircleHelp className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="font-semibold">
                                    Câu hỏi thường gặp
                                </h2>
                                <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                                    Câu trả lời cho những vấn đề phổ biến.
                                </p>
                            </div>
                        </div>

                        <div className="divide-y divide-[var(--app-border)]">
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item) => (
                                    <div key={item.title}>
                                        {activeCategory === "Tất cả" && (
                                            <p className="pb-2 pt-4 text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                                                {item.title}
                                            </p>
                                        )}

                                        {item.questions.map((q) => {
                                            const isOpen = openQuestion === q.question;

                                            return (
                                                <div key={q.question}>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setOpenQuestion(
                                                                isOpen ? null : q.question,
                                                            )
                                                        }
                                                        className="flex w-full items-center justify-between gap-4 py-4 text-left"
                                                        aria-expanded={isOpen}
                                                    >
                                                        <span className="text-sm font-medium">
                                                            {q.question}
                                                        </span>

                                                        <ChevronDown
                                                            className={`h-4 w-4 shrink-0 text-[var(--app-text-muted)] transition-transform ${isOpen ? "rotate-180" : ""
                                                                }`}
                                                        />
                                                    </button>

                                                    {isOpen && (
                                                        <p className="max-w-3xl pb-4 pr-6 text-sm leading-6 text-[var(--app-text-secondary)]">
                                                            {q.answer}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center">
                                    <Search className="mx-auto h-6 w-6 text-[var(--app-text-muted)]" />
                                    <p className="mt-3 text-sm text-[var(--app-text-secondary)]">
                                        Không tìm thấy nội dung phù hợp.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch("");
                                            setActiveCategory("Tất cả");
                                        }}
                                        className="mt-2 text-sm text-[var(--app-accent)] hover:underline"
                                    >
                                        Xóa bộ lọc
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                                <MessageCircle className="h-5 w-5" />
                            </div>

                            <h3 className="mt-4 text-lg font-semibold">
                                Vẫn cần trợ giúp?
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-[var(--app-text-secondary)]">
                                Hãy gửi câu hỏi cho đội ngũ hỗ trợ nếu bạn chưa tìm thấy
                                câu trả lời phù hợp.
                            </p>

                            <a
                                href="mailto:support@aiveo3.org?subject=VideoGen%20AI%20Support"
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-accent)] px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
                            >
                                <Mail className="h-4 w-4" />
                                Liên hệ hỗ trợ
                            </a>

                            <p className="mt-3 text-xs leading-5 text-[var(--app-text-muted)]">
                                Khi báo lỗi, hãy cung cấp mô tả vấn đề và mã tác vụ nếu có.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-[var(--app-accent)]" />
                                <h3 className="text-sm font-semibold">
                                    Mẹo sử dụng
                                </h3>
                            </div>

                            <ul className="mt-3 space-y-3 text-sm leading-5 text-[var(--app-text-secondary)]">
                                <li className="flex gap-2">
                                    <span className="text-[var(--app-accent)]">01.</span>
                                    Mô tả rõ vấn đề bạn đang gặp.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[var(--app-accent)]">02.</span>
                                    Gửi mã tác vụ hoặc ảnh chụp lỗi nếu có.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[var(--app-accent)]">03.</span>
                                    Không gửi mật khẩu hay thông tin nhạy cảm.
                                </li>
                            </ul>
                        </div>
                    </aside>
                </section>

                <footer className="border-t border-[var(--app-border)] pt-5 text-center text-xs text-[var(--app-text-muted)]">
                    VideoGen AI · Trung tâm hỗ trợ
                </footer>
            </div>
        </main>
    );
}
