import api from "@/services/api";

import type {
    UploadImagesResponse,
} from "@/types/api";

const USE_MOCK_API =
    import.meta.env.VITE_USE_MOCK_API !== "false";

export const imageService = {
    async uploadImages(
        files: File[],
    ): Promise<UploadImagesResponse> {
        if (files.length === 0) {
            return {
                images: [],
            };
        }

        if (USE_MOCK_API) {
            return {
                images: files.map((file, index) => ({
                    imageId: `mock-image-${Date.now()}-${index}`,
                    mime: file.type,
                    size: file.size,
                    sha256: "",
                    createdAt: new Date().toISOString(),
                    expiresAt: new Date(
                        Date.now() + 24 * 60 * 60 * 1000,
                    ).toISOString(),
                })),
            };
        }

        const formData = new FormData();

        files.forEach((file, index) => {
            formData.append(
                index === 0 ? "file" : `file${index + 1}`,
                file,
            );
        });

        const response =
            await api.post<UploadImagesResponse>(
                "/v1/images",
                formData,
            );

        return response.data;
    },

    async uploadImage(
        file: File,
    ): Promise<string> {
        const response =
            await this.uploadImages([file]);

        const image = response.images[0];

        if (!image) {
            throw new Error(
                "IMAGE_UPLOAD_FAILED",
            );
        }

        return image.imageId;
    },
};