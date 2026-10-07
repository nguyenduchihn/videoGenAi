import { AlertTriangle } from "lucide-react";
import Modal from "./modal";
import Button from "./button";

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    danger?: boolean;
}

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    loading = false,
    danger = true,
}: ConfirmDialogProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            width="sm"
        >
            <div className="p-5">
                <div className="flex items-start gap-4">
                    <div
                        className={[
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                            danger
                                ? "bg-red-50 text-red-600"
                                : "bg-violet-50 text-violet-600",
                        ].join(" ")}
                    >
                        <AlertTriangle className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-base font-semibold text-gray-950">
                            {title}
                        </h2>

                        <p className="mt-1.5 text-sm leading-6 text-gray-500">
                            {description}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>

                    <Button
                        variant={danger ? "danger" : "primary"}
                        loading={loading}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}