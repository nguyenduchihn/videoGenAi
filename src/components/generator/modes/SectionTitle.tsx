export default function SectionTitle({ title, description }: { title: string; description?: string }) {
    return (
        <div className="mb-3">
            <h3 className="text-sm font-semibold text-[var(--app-text)]">{title}</h3>
            {description && <p className="mt-0.5 text-xs leading-5 text-[var(--app-text-muted)]">{description}</p>}
        </div>
    );
}
