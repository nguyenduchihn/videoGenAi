interface LibraryPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function LibraryPagination({
    currentPage,
    totalPages,
    onPageChange,
}: LibraryPaginationProps) {
    if (totalPages <= 1) return null;

    const buttonClass =
        "inline-flex min-w-9 items-center justify-center rounded-lg border px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40";

    return (
        <nav
            aria-label="Phân trang thư viện"
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
        >
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className={`${buttonClass} border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-surface-soft)]`}
                aria-label="Trang trước"
            >
                ←
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => {
                    const isActive = page === currentPage;

                    return (
                        <button
                            key={page}
                            type="button"
                            onClick={() => onPageChange(page)}
                            aria-current={isActive ? "page" : undefined}
                            className={`${buttonClass} ${isActive
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : "border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-surface-soft)]"
                                }`}
                        >
                            {page}
                        </button>
                    );
                },
            )}

            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={`${buttonClass} border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-surface-soft)]`}
                aria-label="Trang sau"
            >
                →
            </button>
        </nav>
    );
}
