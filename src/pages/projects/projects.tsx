import {
    Check,
    ChevronDown,
    FolderKanban,
    Plus,
    Search,
} from "lucide-react";
import { useMemo, useState } from "react";

import GeneratorPanel from "@/components/generator/generatorPanel";

type Project = {
    id: string;
    name: string;
    description: string;
};

const INITIAL_PROJECTS: Project[] = [
    {
        id: "1",
        name: "Video quảng cáo sản phẩm",
        description: "Tạo video quảng cáo sản phẩm bằng AI",
    },
    {
        id: "2",
        name: "Video giới thiệu sản phẩm",
        description: "Video giới thiệu sản phẩm cho social media",
    },
    {
        id: "3",
        name: "Video TikTok",
        description: "Các video ngắn cho TikTok",
    },
];

export default function Projects() {
    const [projects, setProjects] =
        useState<Project[]>(INITIAL_PROJECTS);

    const [selectedProjectId, setSelectedProjectId] =
        useState("1");

    const [projectMenuOpen, setProjectMenuOpen] =
        useState(false);

    const [search, setSearch] = useState("");

    const selectedProject =
        projects.find(
            (project) =>
                project.id === selectedProjectId
        ) ?? projects[0];

    const filteredProjects = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return projects;
        }

        return projects.filter((project) =>
            `${project.name} ${project.description}`
                .toLowerCase()
                .includes(keyword)
        );
    }, [projects, search]);

    const handleSelectProject = (project: Project) => {
        setSelectedProjectId(project.id);
        setProjectMenuOpen(false);
        setSearch("");
    };

    const handleCreateProject = () => {
        const newProject: Project = {
            id: `project-${Date.now()}`,
            name: "Dự án mới",
            description: "Workspace mới",
        };

        setProjects((current) => [
            newProject,
            ...current,
        ]);

        setSelectedProjectId(newProject.id);
        setProjectMenuOpen(false);
        setSearch("");
    };

    if (!selectedProject) {
        return null;
    }

    return (
        <div className="h-[calc(100vh-64px)] min-h-0 overflow-hidden bg-[var(--app-bg)]">
            <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-[var(--app-border)] bg-[var(--app-surface)] px-4 transition-colors sm:px-6">
                <div className="relative">
                    <button
                        type="button"
                        onClick={() =>
                            setProjectMenuOpen(
                                (current) => !current
                            )
                        }
                        className="group flex max-w-[calc(100vw-100px)] items-center gap-2 rounded-xl px-2 py-1.5 text-left transition hover:bg-[var(--app-surface-soft)]"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--app-surface-soft)]">
                            <FolderKanban className="h-4 w-4 text-[var(--app-text-secondary)]" />
                        </div>

                        <div className="min-w-0">
                            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                                Project
                            </p>

                            <p className="truncate text-sm font-semibold text-gray-900">
                                {selectedProject.name}
                            </p>
                        </div>

                        <ChevronDown
                            className={`h-4 w-4 shrink-0 text-gray-400 transition ${projectMenuOpen
                                ? "rotate-180"
                                : ""
                                }`}
                        />
                    </button>

                    {projectMenuOpen && (
                        <>
                            <button
                                type="button"
                                aria-label="Đóng project menu"
                                onClick={() =>
                                    setProjectMenuOpen(false)
                                }
                                className="fixed inset-0 z-40 cursor-default bg-black/5 lg:hidden"
                            />

                            <div className="absolute left-0 top-[52px] z-50 w-[min(380px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-xl">
                                <div className="border-b border-gray-100 p-3">
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(event) =>
                                                setSearch(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Tìm kiếm dự án..."
                                            autoFocus
                                            className="h-10 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] pl-9 pr-3 text-sm text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-accent)] focus:bg-[var(--app-surface)]" />
                                    </div>
                                </div>
                                <div className="max-h-[320px] overflow-y-auto p-2">
                                    {filteredProjects.length > 0 ? (
                                        filteredProjects.map(
                                            (project) => {
                                                const active =
                                                    project.id ===
                                                    selectedProjectId;

                                                return (
                                                    <button
                                                        key={project.id}
                                                        type="button"
                                                        onClick={() =>
                                                            handleSelectProject(
                                                                project
                                                            )
                                                        }
                                                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${active
                                                            ? "bg-[var(--app-accent-soft)]"
                                                            : "hover:bg-[var(--app-surface-soft)]"
                                                            }`}
                                                    >
                                                        <div
                                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active
                                                                ? "bg-[var(--app-accent)] text-white"
                                                                : "bg-[var(--app-surface-soft)] text-[var(--app-text-secondary)]"
                                                                }`}
                                                        >
                                                            <FolderKanban className="h-4 w-4" />
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-medium text-gray-900">
                                                                {
                                                                    project.name
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 truncate text-xs text-gray-400">
                                                                {
                                                                    project.description
                                                                }
                                                            </p>
                                                        </div>

                                                        {active && (
                                                            <Check className="h-4 w-4 shrink-0 text-[var(--app-accent)]" />
                                                        )}
                                                    </button>
                                                );
                                            }
                                        )
                                    ) : (
                                        <div className="px-4 py-8 text-center">
                                            <Search className="mx-auto h-5 w-5 text-gray-300" />

                                            <p className="mt-2 text-xs text-gray-500">
                                                Không tìm thấy dự án
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-gray-100 p-2">
                                    <button
                                        type="button"
                                        onClick={
                                            handleCreateProject
                                        }
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[var(--app-text)] transition hover:bg-[var(--app-surface-soft)]">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--app-accent)] text-white">
                                            <Plus className="h-4 w-4" />
                                        </div>

                                        <div>
                                            <p>
                                                Dự án mới
                                            </p>

                                            <p className="mt-0.5 text-xs font-normal text-gray-400">
                                                Tạo workspace mới
                                            </p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="hidden text-xs text-gray-400 sm:block">
                        Workspace
                    </span>
                </div>
            </header>

            <main className="h-[calc(100%-64px)] min-h-0 overflow-y-auto bg-[var(--app-surface)] transition-colors lg:overflow-hidden">
                <GeneratorPanel
                    key={selectedProject.id}
                    variant="advanced"
                    layout="project"
                />
            </main>
        </div>
    );
}