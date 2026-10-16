import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { DomainMovedBanner } from "./DomainMovedBanner";

describe("DomainMovedBanner", () => {
    beforeEach(() => localStorage.clear());

    it("hiện base URL mới, ẩn được và nhớ trạng thái ẩn", async () => {
        const { unmount } = render(<DomainMovedBanner now={new Date("2026-10-20T00:00:00+07:00").getTime()} />);
        expect(screen.getByRole("note").textContent).toContain("https://api.aiveo3.org/v1");
        await userEvent.click(screen.getByRole("button", { name: "Ẩn thông báo đổi tên miền" }));
        expect(screen.queryByRole("note")).toBeNull();
        unmount();
        render(<DomainMovedBanner now={new Date("2026-10-20T00:00:00+07:00").getTime()} />);
        expect(screen.queryByRole("note")).toBeNull();
    });

    it("tự hết sau ngày 31/10", () => {
        render(<DomainMovedBanner now={new Date("2026-11-01T00:00:00+07:00").getTime()} />);
        expect(screen.queryByRole("note")).toBeNull();
    });
});
