import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CodeTabs } from "./CodeTabs";

const tabs = [
    { label: "cURL", lang: "bash" as const, code: "curl https://api.aiveo3.org/v1/me" },
    { label: "Python", lang: "python" as const, code: "import requests" },
    { label: "Node.js", lang: "js" as const, code: "await fetch()" },
];

describe("CodeTabs", () => {
    it("chọn Python ở một khối ⇒ mọi khối trên trang đổi theo và nhớ vào localStorage", () => {
        render(<><CodeTabs title="A" tabs={tabs} /><CodeTabs title="B" tabs={tabs} /></>);
        fireEvent.click(within(screen.getByRole("tablist", { name: "Ngôn ngữ: A" })).getByRole("tab", { name: "Python" }));
        expect(screen.getByRole("group", { name: "A (Python)" })).toHaveTextContent("import requests");
        expect(screen.getByRole("group", { name: "B (Python)" })).toBeInTheDocument();
        expect(localStorage.getItem("api-docs:code-lang")).toBe("Python");
    });

    it("phím mũi tên / End di chuyển tab và focus (WAI-ARIA tablist)", () => {
        render(<CodeTabs title="K" tabs={tabs} />);
        const curl = screen.getByRole("tab", { name: "cURL" });
        fireEvent.click(curl);
        fireEvent.keyDown(curl, { key: "ArrowRight" });
        expect(screen.getByRole("tab", { name: "Python" })).toHaveAttribute("aria-selected", "true");
        fireEvent.keyDown(screen.getByRole("tab", { name: "Python" }), { key: "End" });
        expect(screen.getByRole("tab", { name: "Node.js" })).toHaveFocus();
    });

    it("nút Sao chép ghi mã của tab đang chọn", () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, { clipboard: { writeText } });
        render(<CodeTabs title="C" tabs={tabs} />);
        fireEvent.click(screen.getByRole("tab", { name: "Node.js" }));
        fireEvent.click(screen.getByRole("button", { name: "Sao chép" }));
        expect(writeText).toHaveBeenCalledWith("await fetch()");
    });

    it("một tab ⇒ không có tablist, chỉ chú thích", () => {
        render(<CodeTabs title="202 Accepted" tabs={[{ label: "202 Accepted", lang: "json", code: "{}" }]} />);
        expect(screen.queryByRole("tablist")).toBeNull();
        expect(screen.getByText("202 Accepted")).toBeInTheDocument();
    });
});
