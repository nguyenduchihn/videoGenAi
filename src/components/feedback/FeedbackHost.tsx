import { useFeedbackStore } from "@/stores/feedback.store";
import { useDelayedVisible } from "./useDelayedVisible";
import { OverlayLoader } from "./OverlayLoader";
import { ToastStack } from "./ToastStack";
import { ConfirmDialog } from "./ConfirmDialog";
import { ConnectKeyDialog } from "./ConnectKeyDialog";

export function FeedbackHost() {
    const overlays = useFeedbackStore((s) => s.overlays);
    const top = overlays[overlays.length - 1] ?? null;
    const visible = useDelayedVisible(!!top);
    return (
        <>
            {visible && top && (
                <OverlayLoader message={top.message} blocking={top.blocking} />
            )}
            <ToastStack />
            <ConfirmDialog />
            <ConnectKeyDialog />
        </>
    );
}

export default FeedbackHost;
