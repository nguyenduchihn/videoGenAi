import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ConfirmGenerateDialog from "./ConfirmGenerateDialog";

const renderDialog = (over: Partial<Parameters<typeof ConfirmGenerateDialog>[0]> = {}) => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmGenerateDialog open jobCount={1200} estimatedCredits={6000} balance={1240} queuedOnServer={700} defaultName="Lượt tạo · 1200 job" onConfirm={onConfirm} onCancel={onCancel} {...over} />);
    return { onConfirm, onCancel };
};

describe("ConfirmGenerateDialog", () => {
    it("shows job count, credit estimate vs balance, the server-queue note and the insufficient-credit warning", () => {
        renderDialog();
        const dialog = screen.getByRole("dialog", { name: "Xác nhận tạo lô" });
        expect(dialog).toHaveTextContent("1.200");
        expect(dialog).toHaveTextContent("6.000 credit");
        expect(dialog).toHaveTextContent("700 job vượt hạn mức hàng đợi");
        expect(screen.getByRole("alert")).toHaveTextContent("Không đủ credit");
    });

    it("confirms with the trimmed name (null when blank) and resets the field after closing", async () => {
        const user = userEvent.setup();
        const { onConfirm, onCancel } = renderDialog({ balance: 10_000, queuedOnServer: 0 });
        expect(screen.queryByRole("alert")).toBeNull();
        await user.click(screen.getByRole("button", { name: /^Tạo 1\.200 job/ }));
        expect(onConfirm).toHaveBeenCalledWith(null);

        await user.type(screen.getByLabelText(/Tên lượt tạo/), "  Lô mèo  ");
        expect(screen.getByLabelText(/Tên lượt tạo/)).toHaveValue("  Lô mèo  ");
        await user.click(screen.getByRole("button", { name: /^Tạo 1\.200 job/ }));
        expect(onConfirm).toHaveBeenLastCalledWith("Lô mèo");
        expect(screen.getByLabelText(/Tên lượt tạo/)).toHaveValue("");

        await user.click(screen.getByRole("button", { name: "Huỷ" }));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});
