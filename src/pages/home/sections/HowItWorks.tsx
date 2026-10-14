const STEPS = [
    { n: "01", title: "Mô tả ý tưởng", desc: "Cho AI biết video bạn muốn tạo và phong cách mong muốn." },
    { n: "02", title: "AI xây dựng nội dung", desc: "AI phân tích yêu cầu và tạo cấu trúc nội dung phù hợp." },
    { n: "03", title: "Tinh chỉnh", desc: "Chỉnh sửa nội dung, hình ảnh, giọng nói và phong cách." },
    { n: "04", title: "Xuất video", desc: "Hoàn thiện video và xuất sản phẩm theo nhu cầu." },
];

export function HowItWorks() {
    return (
        <section id="cach-hoat-dong" aria-labelledby="how-heading" className="scroll-mt-20 border-t border-app-border bg-app-surface">
            <div className="mx-auto max-w-7xl px-4 py-24 lg:px-8 lg:py-28">
                <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-app-accent">Workflow</p>
                    <h2 id="how-heading" className="mt-4 text-3xl font-semibold tracking-tight text-app-text sm:text-4xl">
                        Từ ý tưởng đến video chỉ trong vài bước
                    </h2>
                    <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-app-text-secondary sm:text-base">
                        Quy trình được thiết kế để bạn tập trung vào nội dung thay vì phải xử lý những thao tác phức tạp.
                    </p>
                </div>
                <div className="relative mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                    <div
                        aria-hidden="true"
                        className="absolute left-[12%] right-[12%] top-8 hidden h-px bg-gradient-to-r from-transparent via-app-border to-transparent lg:block"
                    />
                    {STEPS.map((s) => (
                        <div key={s.n} className="relative rounded-2xl border border-app-border bg-app-bg p-5">
                            <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-app-accent/20 bg-app-accent-soft text-xs font-semibold text-app-accent">
                                {s.n}
                            </div>
                            <h3 className="mt-6 text-sm font-semibold text-app-text">{s.title}</h3>
                            <p className="mt-2 text-xs leading-5 text-app-text-muted">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
