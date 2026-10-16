export interface FaqItem {
    q: string;
    a: string;
}

interface FaqContext {
    signupGrant?: number;
    maxBatchTasks?: number;
    subscription: boolean;
}

const fmt = new Intl.NumberFormat("vi-VN");

/** Câu hỏi thường gặp; số liệu lấy từ bảng giá công khai để không lệch cấu hình admin. */
export function buildFaq({ signupGrant, maxBatchTasks, subscription }: FaqContext): FaqItem[] {
    const grant = signupGrant && signupGrant > 0 ? `${fmt.format(signupGrant)} credit` : "credit";
    return [
        {
            q: "Có dùng thử miễn phí không?",
            a: `Có. Đăng ký tài khoản là nhận ngay ${grant} để tạo thử video và ảnh, không cần thẻ tín dụng.`,
        },
        {
            q: subscription ? "Gói dịch vụ hoạt động thế nào?" : "Credit có hết hạn không?",
            a: subscription
                ? "Mỗi gói có giá và kỳ hạn; thanh toán xong gói kích hoạt tự động. Gia hạn trước hạn được cộng dồn số ngày còn lại."
                : "Không. Credit đã nạp không có hạn dùng và chỉ bị trừ khi bạn tạo thành công một lượt.",
        },
        {
            q: "Thanh toán bằng cách nào?",
            a: "Chuyển khoản ngân hàng nội địa qua mã VietQR hiện trên trang nạp. Hệ thống đối soát tự động và cộng credit trong vài phút, có email biên nhận.",
        },
        {
            q: "Video và ảnh được tạo bằng model gì?",
            a: "Video dùng Google Veo 3.1 (các chế độ văn bản, ảnh, ảnh tham chiếu, khung đầu-cuối, kéo dài); ảnh và upscale cũng chạy trên hạ tầng Google. Giá từng model hiện trong bảng giá.",
        },
        {
            q: "Mất bao lâu để có một video?",
            a: "Thường từ một tới vài phút tuỳ độ dài và hàng đợi. Lượt tạo chạy trên máy chủ nên bạn có thể tắt tab, quay lại vẫn thấy tiến độ.",
        },
        {
            q: "Tôi có thể tạo bao nhiêu video cùng lúc?",
            a: `Số job chạy song song phụ thuộc gói của bạn; phần còn lại xếp hàng tự động. Qua API, một request gửi được tới ${maxBatchTasks ? fmt.format(maxBatchTasks) : "nhiều"} task.`,
        },
        {
            q: "Task lỗi có bị trừ credit không?",
            a: "Không. Task thất bại được hoàn credit tự động và ghi rõ trong sao kê; bạn có thể bấm Thử lại ngay trên thẻ kết quả.",
        },
        {
            q: "Tích hợp API như thế nào?",
            a: "Tạo API key trong Cài đặt › API keys, gửi header X-API-Key tới POST /v1/tasks, nhận kết quả qua webhook hoặc GET /v1/batches/:id. Tài liệu Swagger và OpenAPI có tại api.aiveo3.org/docs.",
        },
    ];
}
