import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";

const icons = {
  success: <CircleCheck className="text-green-500" size={16} strokeWidth={2} />,
  info: <Info className="text-blue-500" size={16} strokeWidth={2} />,
  warning: (
    <TriangleAlert className="text-amber-500" size={16} strokeWidth={2} />
  ),
  error: <CircleAlert className="text-red-500" size={16} strokeWidth={2} />,
};
interface AlertBoxPropTypes {
  message: string;
  onClose: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  messageType: keyof typeof icons;
}
export default function AlertBox({
  message,
  onClose,
  messageType,
}: AlertBoxPropTypes) {
  return (
    <Alert
      layout="row"
      isNotification
      className="mx-auto fixed top-1/9 right-5 z-50 bg-black/80 text-white shadow-lg shadow-black/20 backdrop-blur-sm"
      icon={icons[messageType]}
      variant={messageType}
      action={
        <Button
          variant="ghost"
          className="cursor-pointer group -my-1.5 -me-2 size-8 p-0 hover:bg-transparent"
          aria-label="Close notification"
          onClick={onClose}
        >
          <X
            size={16}
            strokeWidth={2}
            className="opacity-60 transition-opacity group-hover:opacity-100"
          />
        </Button>
      }
    >
      <p className="text-sm">{message}</p>
    </Alert>
  );
}
