import { Button } from "../components/ui/button";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";

const icons = {
  success: <CircleCheck className="text-green-500" size={24} strokeWidth={2} />,
  info: <Info className="text-blue-500" size={24} strokeWidth={2} />,
  warning: (
    <TriangleAlert className="text-amber-500" size={24} strokeWidth={2} />
  ),
  error: <CircleAlert className="text-red-500" size={24} strokeWidth={2} />,
};

interface AlertConfirmBoxPropTypes {
  message: string;
  onClose: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  messageType: keyof typeof icons;
  cancelText?: string;
  confirmText?: string;
  onCancel: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onConfirm: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export default function AlertConfirmBox({
  message,
  onClose,
  onCancel,
  onConfirm,
  messageType,
  cancelText,
  confirmText,
}: AlertConfirmBoxPropTypes) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-sm rounded-lg border border-gray-300 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-900 dark:text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="cursor-pointer absolute right-2 top-2 p-1 text-gray-400 hover:text-black dark:hover:text-white"
          aria-label="Close"
        >
          <X size={18} strokeWidth={2} />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3">
          <div className="mt-1 shrink-0">{icons[messageType]}</div>
          <p className="text-sm">{message}</p>
        </div>

        {/* Buttons */}
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="outline"
            className="cursor-pointer px-4 py-2 text-sm text-red-400 hover:bg-red-500 hover:text-white"
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button
            variant={messageType === "error" ? "destructive" : "default"}
            className="cursor-pointer px-4 py-2 text-sm text-blue-300 border border-blue-300 hover:bg-blue-500 hover:text-white"
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
