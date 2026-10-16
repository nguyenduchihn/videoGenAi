/** Lỗi phía client trước khi gọi API (thiếu ảnh, upload thiếu id…). */
export class GeneratorError extends Error {
    code: string;
    constructor(code: string, message: string) {
        super(message);
        this.name = "GeneratorError";
        this.code = code;
    }
}
