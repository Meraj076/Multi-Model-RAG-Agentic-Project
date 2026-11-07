import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(undefined);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type, title, message = "", duration = 5000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none p-4">
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
            error: <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
            info: <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />,
          };

          const borderColors = {
            success: "border-emerald-500/40 bg-slate-900/95 shadow-emerald-950/20",
            warning: "border-amber-500/40 bg-slate-900/95 shadow-amber-950/20",
            error: "border-rose-500/40 bg-slate-900/95 shadow-rose-950/20",
            info: "border-cyan-500/40 bg-slate-900/95 shadow-cyan-950/20",
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                borderColors[toast.type] || borderColors.info
              }`}
            >
              {icons[toast.type] || icons.info}
              <div className="flex-1 text-sm min-w-0">
                <p className="font-semibold text-slate-100">{toast.title}</p>
                {toast.message && (
                  <p className="text-slate-300 mt-1 break-words leading-relaxed text-xs">
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
