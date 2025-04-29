import { Toaster } from "sonner";

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  return (
    <>
      {children}
      <Toaster richColors position="bottom-right" />
    </>
  );
};
