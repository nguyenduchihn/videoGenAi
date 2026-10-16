import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ImageSlot from "./imageSlot";
import { attachFiles, moveItem } from "./imageSlotFiles";
import type { AttachedImage } from "./types";

const png = (name: string, size = 10): File => new File(["x".repeat(size)], name, { type: "image/png" });
const attached = (name: string, handle = ""): AttachedImage => ({ localId: name, file: png(name), previewUrl: "", handle });

describe("attachFiles", () => {
    it("accepts images, rejects other types and files over 20 MB with inline messages", () => {
        const big = new File([new Uint8Array(1)], "big.png", { type: "image/png" });
        Object.defineProperty(big, "size", { value: 21 * 1024 * 1024 });
        const { items, errors } = attachFiles([], [png("ok.png"), new File(["t"], "doc.txt", { type: "text/plain" }), big], 5);
        expect(items.map((i) => i.file.name)).toEqual(["ok.png"]);
        expect(errors).toEqual([
            "Tệp doc.txt: định dạng không được hỗ trợ — chấp nhận PNG, JPG, WEBP, GIF, AVIF.",
            "Tệp big.png vượt giới hạn 20 MB — vui lòng chọn tệp nhỏ hơn.",
        ]);
    });

    it("flags images over 16 MiB with a soft warning and skips duplicates", () => {
        const large = new File([new Uint8Array(1)], "large.png", { type: "image/png" });
        Object.defineProperty(large, "size", { value: 17 * 1024 * 1024 });
        const same = png("same.png");
        const { items } = attachFiles([], [large, same, same], 5);
        expect(items).toHaveLength(2);
        expect(items[0]?.warning).toContain("16 MB");
        expect(items[1]?.warning).toBeUndefined();
    });

    it("enforces the slot maximum and reports it once", () => {
        const { items, errors } = attachFiles([attached("a")], [png("b"), png("c"), png("d")], 3);
        expect(items).toHaveLength(3);
        expect(errors).toEqual(["Chỉ chọn tối đa 3 ảnh."]);
    });

    it("moveItem reorders within bounds and is a no-op outside", () => {
        const items = [attached("a"), attached("b"), attached("c")];
        expect(moveItem(items, 2, 0).map((i) => i.localId)).toEqual(["c", "a", "b"]);
        expect(moveItem(items, 0, -1)).toBe(items);
    });
});

describe("ImageSlot", () => {
    it("renders a labelled drop zone, adds files through the hidden input and calls onChange", async () => {
        const onChange = vi.fn();
        const { container } = render(<ImageSlot role="start" label="Khung đầu" required items={[]} max={1} onChange={onChange} />);

        expect(screen.getByRole("button", { name: "Khung đầu (bắt buộc): chọn hoặc kéo thả ảnh" })).toBeInTheDocument();
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        await userEvent.upload(input, png("first.png"));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0]?.[0][0].file.name).toBe("first.png");
    });

    it("shows errors inline, reorders with the arrow buttons and edits handles", async () => {
        const onChange = vi.fn();
        const items = [attached("a.png", "girl"), attached("b.png")];
        const { container } = render(<ImageSlot role="references" label="Ảnh tham chiếu" items={items} max={2} withHandles reorder onChange={onChange} />);

        expect(screen.queryByRole("button", { name: /chọn hoặc kéo thả ảnh/ })).toBeNull();
        expect(screen.getByLabelText("Thứ tự 1")).toHaveTextContent("1");

        await userEvent.click(screen.getByRole("button", { name: "Chuyển b.png lên trước" }));
        expect(onChange).toHaveBeenLastCalledWith([items[1], items[0]]);

        const handleInput = container.querySelectorAll("input[id^='handle-']")[1] as HTMLInputElement;
        fireEvent.change(handleInput, { target: { value: "Boy" } });
        expect(onChange).toHaveBeenLastCalledWith([items[0], { ...items[1], handle: "Boy" }]);

        await userEvent.click(screen.getByRole("button", { name: "Xóa a.png" }));
        expect(onChange).toHaveBeenLastCalledWith([items[1]]);
    });

    it("marks an invalid handle with aria-invalid and an explanation", () => {
        render(<ImageSlot role="sources" label="Ảnh nguồn" items={[attached("a.png", "Cô gái")]} max={10} withHandles onChange={vi.fn()} />);
        const input = screen.getByLabelText("Tên ảnh để nhắc trong prompt");
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByText(/Chữ thường, số/)).toBeInTheDocument();
    });

    it("reports an overflow error when more than max files are dropped", async () => {
        const onChange = vi.fn();
        const { container } = render(<ImageSlot role="references" label="Ảnh tham chiếu" items={[]} max={2} onChange={onChange} />);
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        await userEvent.upload(input, [png("1.png"), png("2.png"), png("3.png")]);
        expect(onChange.mock.calls[0]?.[0]).toHaveLength(2);
        expect(screen.getByRole("alert")).toHaveTextContent("Chỉ chọn tối đa 2 ảnh.");
    });
});
