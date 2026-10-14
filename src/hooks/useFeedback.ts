import { useFeedbackStore } from "@/stores/feedback.store";
import { getErrorMessage, toApiError } from "@/lib/errors";

export function useFeedback() {
    const store = useFeedbackStore();

    const showOverlay = store.showOverlay;
    const dismissOverlay = store.dismissOverlay;

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

    const toast = {
        success: (msg: string) => store.pushToast({ variant: "success", message: msg }),
        info: (msg: string) => store.pushToast({ variant: "info", message: msg }),
        warning: (msg: string) => store.pushToast({ variant: "warning", message: msg }),
        error: (msgOrErr: string | unknown) => {
            if (typeof msgOrErr === "string") {
                store.pushToast({ variant: "error", message: msgOrErr });
            } else {
                const ae = toApiError(msgOrErr);
                store.pushToast({ variant: "error", message: getErrorMessage(msgOrErr), requestId: ae.requestId });
            }
        },
    };

    return {
        showOverlay,
        dismissOverlay,
        withOverlay,
        toast,
        confirm: store.askConfirm,
    };
}
