import React, { createContext, useContext, useState } from "react";
import { Description, Provider, Root, Viewport } from "@radix-ui/react-toast";

interface ToastMessage {
  id: number;
  message: string;
  type?: "success" | "error" | "info";
}

interface ToastContextType {
  toast: (message: string, type?: ToastMessage["type"]) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastMessage["type"] = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4300);
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <Provider>
        {toasts.map((toast) => (
          <Root
            key={toast.id}
            className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-2 fixed top-4 right-4 z-10 data-[state=open]:animate-slide-in data-[state=closed]:animate-slide-out"
            duration={4000}
          >
            {toast.type === "success" && (
              <div className="w-4 h-4 rounded-full bg-green-500" />
            )}
            {toast.type === "error" && (
              <div className="w-4 h-4 rounded-full bg-red-500" />
            )}
            {toast.type === "info" && (
              <div className="w-4 h-4 rounded-full bg-blue-500" />
            )}
            <Description className="text-sm text-gray-700">
              {toast.message}
            </Description>
          </Root>
        ))}
        <Viewport />
      </Provider>
    </ToastContext.Provider>
  );
};

export const useToaster = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToaster must be used within a ToastProvider");
  }
  return context;
};
