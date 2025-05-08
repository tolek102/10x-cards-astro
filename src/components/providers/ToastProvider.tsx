import { Toaster } from "sonner";

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  return (
    <>
      {children}
      <div data-astro-transition-persist>
        <Toaster richColors position="bottom-right" />
      </div>
    </>
  );
};
