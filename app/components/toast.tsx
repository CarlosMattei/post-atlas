"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cx } from "@/app/lib/cx";
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, XIcon } from "./icons";

export type ToastTone = "success" | "danger" | "info";

export type ToastInput = {
  tone: ToastTone;
  title: string;
  message?: string;
};

type ToastItem = ToastInput & { id: number };

const ToastContext = createContext<{ toast: (input: ToastInput) => void } | null>(
  null,
);

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast precisa ser usado dentro de ToastProvider.");
  }

  return context;
}

const toneClasses: Record<ToastTone, string> = {
  success: "border-ds-success-text/30 bg-ds-success-bg text-ds-success-text",
  danger: "border-ds-danger-text/30 bg-ds-danger-bg text-ds-danger-text",
  info: "border-ds-info-text/30 bg-ds-info-bg text-ds-info-text",
};

function ToneIcon({ tone }: { tone: ToastTone }) {
  if (tone === "success") return <CheckCircleIcon className="size-4" />;
  if (tone === "danger") return <AlertTriangleIcon className="size-4" />;
  return <InfoIcon className="size-4" />;
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 6000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      role={toast.tone === "danger" ? "alert" : "status"}
      className={cx(
        "ds-toast pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-ds-lg border p-3 shadow-ds-overlay",
        toneClasses[toast.tone],
      )}
    >
      <span className="mt-0.5 shrink-0">
        <ToneIcon tone={toast.tone} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-5">{toast.title}</p>
        {toast.message ? (
          <p className="mt-0.5 break-words text-xs leading-4 opacity-90">
            {toast.message}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Fechar notificação"
        className="shrink-0 rounded-ds p-0.5 outline-none transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((input: ToastInput) => {
    counter.current += 1;
    setToasts((current) => [...current, { ...input, id: counter.current }]);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end">
        {toasts.map((item) => (
          <ToastCard key={item.id} toast={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
