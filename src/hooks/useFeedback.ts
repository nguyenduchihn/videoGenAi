import { useMemo } from "react";
import { useFeedbackStore } from "@/stores/feedback.store";
import { getErrorMessage, toApiError } from "@/lib/errors";

export function useFeedback() {
    const store = useFeedbackStore();

    const showOverlay = store.showOverlay;
    const dismissOverlay = store.dismissOverlay;
    const pushToast = store.pushToast;

    async function withOverlay<T>(
        promise: Promise<T>,
        message: string,
        opts?: { blocking?: boolean },
    ): Promise<T> {
        const token = showOverlay(message, opts);
        try {
            return await promise;
        } finally {
            dismissOverlay(token);
        }
    }

    // Ổn định identity: hook/effect phụ thuộc `toast` (vd useBatchRunner) không chạy lại mỗi render.
    const toast = useMemo(() => ({
        success: (msg: string) => pushToast({ variant: "success", message: msg }),
        info: (msg: string) => pushToast({ variant: "info", message: msg }),
        warning: (msg: string) => pushToast({ variant: "warning", message: msg }),
        error: (msgOrErr: string | unknown) => {
            if (typeof msgOrErr === "string") {
                pushToast({ variant: "error", message: msgOrErr });
            } else {
                const ae = toApiError(msgOrErr);
                pushToast({ variant: "error", message: getErrorMessage(msgOrErr), requestId: ae.requestId });
            }
        },
    }), [pushToast]);

    return {
        showOverlay,
        dismissOverlay,
        withOverlay,
        toast,
        confirm: store.askConfirm,
    };
}
