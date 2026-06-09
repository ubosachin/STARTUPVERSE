"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle
};

const styles = {
  success: "border-success/20 bg-success/5 text-success",
  error: "border-danger/20 bg-danger/5 text-danger",
  info: "border-primary/20 bg-primary/5 text-primary",
  warning: "border-warning/20 bg-warning/5 text-warning"
};

// Global toast state
let toastListeners: ((toasts: ToastItem[]) => void)[] = [];
let toastItems: ToastItem[] = [];

export function toast(message: string, type: ToastType = "info") {
  const id = Math.random().toString(36).slice(2);
  toastItems = [...toastItems, { id, message, type }];
  toastListeners.forEach((fn) => fn(toastItems));
  setTimeout(() => {
    toastItems = toastItems.filter((t) => t.id !== id);
    toastListeners.forEach((fn) => fn(toastItems));
  }, 4000);
}

toast.success = (msg: string) => toast(msg, "success");
toast.error = (msg: string) => toast(msg, "error");
toast.info = (msg: string) => toast(msg, "info");
toast.warning = (msg: string) => toast(msg, "warning");

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const fn = (items: ToastItem[]) => setToasts([...items]);
    toastListeners.push(fn);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== fn);
    };
  }, []);

  function dismiss(id: string) {
    toastItems = toastItems.filter((t) => t.id !== id);
    setToasts([...toastItems]);
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={cn(
              "flex min-w-[280px] max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 shadow-soft animate-slide-up glass",
              styles[t.type]
            )}
          >
            <Icon size={16} className="shrink-0" />
            <p className="flex-1 text-sm font-semibold text-ink">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="grid size-6 shrink-0 place-items-center rounded-lg text-muted transition hover:text-ink"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
