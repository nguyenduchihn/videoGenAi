/** Backend chỉ nhận Idempotency-Key 8–128 ký tự [A-Za-z0-9_-]: ghép các phần bằng '-' và lọc ký tự lạ. */
export const idempotencyKeyOf = (...parts: string[]): string =>
    parts.join("-").replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 128).padEnd(8, "0");
