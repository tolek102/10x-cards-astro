import { toast } from "sonner";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
  description?: string;
  duration?: number;
}

export const showToast = (message: string, type: ToastType = "info", options: ToastOptions = {}) => {
  const { description, duration = 5000 } = options;

  switch (type) {
    case "success":
      toast.success(message, {
        description,
        duration,
      });
      break;
    case "error":
      toast.error(message, {
        description,
        duration,
      });
      break;
    case "warning":
      toast.warning(message, {
        description,
        duration,
      });
      break;
    default:
      toast.info(message, {
        description,
        duration,
      });
  }
}; 