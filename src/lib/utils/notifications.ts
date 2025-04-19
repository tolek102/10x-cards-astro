type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationOptions {
  duration?: number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

const defaultOptions: Required<NotificationOptions> = {
  duration: 3000,
  position: "top-right",
};

export function showNotification(
  message: string,
  type: NotificationType = "info",
  options: NotificationOptions = {}
): void {
  const { duration, position } = { ...defaultOptions, ...options };

  const notification = document.createElement("div");
  notification.className = `
    fixed ${getPositionClasses(position)}
    px-4 py-2 rounded-md shadow-md text-white
    transform transition-all duration-300 ease-in-out
    ${getBackgroundColor(type)}
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Animate in
  requestAnimationFrame(() => {
    notification.style.transform = "translateY(0)";
    notification.style.opacity = "1";
  });

  // Remove after duration
  setTimeout(() => {
    notification.style.transform = "translateY(-20px)";
    notification.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, duration);
}

function getPositionClasses(position: Required<NotificationOptions>["position"]): string {
  switch (position) {
    case "top-right":
      return "top-4 right-4";
    case "top-left":
      return "top-4 left-4";
    case "bottom-right":
      return "bottom-4 right-4";
    case "bottom-left":
      return "bottom-4 left-4";
    default:
      return "top-4 right-4";
  }
}

function getBackgroundColor(type: NotificationType): string {
  switch (type) {
    case "success":
      return "bg-green-500";
    case "error":
      return "bg-red-500";
    case "warning":
      return "bg-yellow-500";
    case "info":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
}
