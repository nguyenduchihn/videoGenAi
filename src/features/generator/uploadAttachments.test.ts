import { describe, expect, it, vi } from "vitest";
import type { UploadPart } from "@/api/v1.api";
import { EMPTY_ATTACHMENTS, type AttachedImage, type GeneratorAttachments } from "@/components/generator/types";
import type { UploadedImage } from "@/types/api";
import { chunkBySize, forgetImageId, partName, resolveFromCache, uploadAttachments, type UploadCache } from "./uploadAttachments";

let counter = 0;
const image = (handle = "", size = 10): AttachedImage => {
    counter += 1;
    return {
        localId: `img-${counter}`,
        file: new File(["x".repeat(size)], `f${counter}.png`, { type: "image/png" }),
        previewUrl: "blob:x",
        handle,
    };
};
const attachments = (patch: Partial<GeneratorAttachments>): GeneratorAttachments => ({ ...EMPTY_ATTACHMENTS, ...patch });
const uploaded = (name: string, imageId: string): UploadedImage => ({
    imageId, name, filename: name, duplicateOf: null, mime: "image/png", size: 10, sha256: "", createdAt: "", expiresAt: "",
});

describe("uploadAttachments", () => {
    it("names parts by role + 3-digit index and maps ids back by name even when the server reorders", async () => {
        const att = attachments({ start: [image()], references: [image("girl"), image()] });
        const upload = vi.fn(async (parts: UploadPart[]) => ({
            images: [...parts].reverse().map((p, i) => uploaded(p.name, `id_${p.name}_${i}`)),
        }));
        const cache: UploadCache = new Map();

        const resolved = await uploadAttachments(att, cache, { upload });

        expect(upload).toHaveBeenCalledTimes(1);
        expect(upload.mock.calls[0]?.[0].map((p) => p.name)).toEqual(["start_001", "references_001", "references_002"]);
        expect(resolved.start).toMatch(/^id_start_001/);
        expect(resolved.references).toEqual([
            { imageId: expect.stringMatching(/^id_references_001/), handle: "girl" },
            expect.stringMatching(/^id_references_002/),
        ]);
        expect(resolved.end).toBeUndefined();
    });

    it("skips files already in the cache and only uploads the new ones", async () => {
        const kept = image();
        const fresh = image();
        const cache: UploadCache = new Map([[kept.file, "cached_id"]]);
        const upload = vi.fn(async (parts: UploadPart[]) => ({ images: parts.map((p) => uploaded(p.name, "new_id")) }));

        const resolved = await uploadAttachments(attachments({ sources: [kept, fresh] }), cache, { upload });

        expect(upload.mock.calls[0]?.[0].map((p) => p.name)).toEqual(["sources_002"]);
        expect(resolved.sources).toEqual(["cached_id", "new_id"]);
    });

    it("does not call the API when everything is cached and still resolves voice + sourceMediaId", async () => {
        const item = image();
        const cache: UploadCache = new Map([[item.file, "id1"]]);
        const upload = vi.fn();

        const resolved = await uploadAttachments(attachments({ references: [item], voice: "  giọng nữ ", sourceMediaId: "m1" }), cache, { upload });

        expect(upload).not.toHaveBeenCalled();
        expect(resolved).toEqual({ start: undefined, end: undefined, references: ["id1"], sources: [], voice: "giọng nữ", sourceMediaId: "m1" });
    });

    it("throws UPLOAD_INCOMPLETE when the server omits a part", async () => {
        const upload = vi.fn(async () => ({ images: [] }));
        await expect(uploadAttachments(attachments({ start: [image()] }), new Map(), { upload })).rejects.toMatchObject({ code: "UPLOAD_INCOMPLETE" });
    });

    it("reports progress across chunks and splits requests by size and count", async () => {
        const big = image("", 60);
        const small1 = image("", 10);
        const small2 = image("", 10);
        const upload = vi.fn(async (parts: UploadPart[], opts: { onUploadProgress?: (loaded: number, total: number) => void }) => {
            opts.onUploadProgress?.(parts.reduce((s, p) => s + p.file.size, 0), 0);
            return { images: parts.map((p) => uploaded(p.name, `id_${p.name}`)) };
        });
        const progress: number[] = [];

        const chunks = chunkBySize([big, small1, small2], 50, 100);
        expect(chunks.map((c) => c.length)).toEqual([1, 2]);
        expect(chunkBySize([small1, small2, big], 1000, 2).map((c) => c.length)).toEqual([2, 1]);

        await uploadAttachments(attachments({ sources: [big, small1, small2] }), new Map(), {
            upload,
            onProgress: ({ loaded, total }) => progress.push(Math.round((loaded / total) * 100)),
        });
        expect(progress.at(-1)).toBe(100);
    });

    it("partName pads the index and forgetImageId drops every file pointing to that id", () => {
        expect(partName("references", 0)).toBe("references_001");
        const a = image();
        const b = image();
        const cache: UploadCache = new Map([[a.file, "dup"], [b.file, "dup"]]);
        expect(forgetImageId(cache, "dup")).toBe(true);
        expect(cache.size).toBe(0);
        expect(forgetImageId(cache, "missing")).toBe(false);
        expect(() => resolveFromCache(attachments({ start: [a] }), cache)).toThrow(/chưa được tải lên/);
    });
});
