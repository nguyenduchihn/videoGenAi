/** Lớp Tailwind cho khung xem trước theo tỷ lệ (bộ chọn tỷ lệ + thẻ kết quả ảnh). */
export function getRatioPreviewClass(ratio: string | undefined): string {
    switch (ratio) {
        case "1:1":
            return "aspect-square";
        case "3:4":
            return "aspect-[3/4]";
        case "4:3":
            return "aspect-[4/3]";
        case "9:16":
            return "aspect-[9/16]";
        case "16:9":
        default:
            return "aspect-video";
    }
}
