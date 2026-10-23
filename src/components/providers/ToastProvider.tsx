"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Toast, { type ToastData, type ToastType } from "@/components/ui/Toast";

const DEFAULT_DURATION = 5000;
// Matches the exit slide + the stack closing the gap (toast-out 450ms, collapse 100ms delay + 500ms)
const EXIT_MS = 600;
const MAX_VISIBLE = 4;

type ToastOptions = {
  description?: string;
  /** ms before it closes itself; Infinity keeps it until dismissed */
  duration?: number;
};

type ShowToast = (title: string, options?: ToastOptions) => number;

type ToastContextValue = {
  success: ShowToast;
  error: ShowToast;
  info: ShowToast;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const nextId = useRef(0);
  const removals = useRef(new Set<number>());

  // Dismissing only flags the toast so it can slide out first…
  const dismiss = useCallback((id: number) => {
    setToasts((all) => all.map((t) => (t.id === id && !t.leaving ? { ...t, leaving: true } : t)));
  }, []);

  // …then it is dropped from the list once the exit animation has finished
  useEffect(() => {
    toasts.forEach(({ id, leaving }) => {
      if (!leaving || removals.current.has(id)) return;
      removals.current.add(id);
      setTimeout(() => {
        removals.current.delete(id);
        setToasts((all) => all.filter((t) => t.id !== id));
      }, EXIT_MS);
    });
  }, [toasts]);

  const show = useCallback(
    (type: ToastType): ShowToast =>
      (title, { description, duration = DEFAULT_DURATION } = {}) => {
        const id = ++nextId.current;
        setToasts((all) => {
          const next = [{ id, type, title, description, duration, leaving: false }, ...all];
          // Oldest beyond the limit start leaving rather than piling up
          const overflow = new Set(next.filter((t) => !t.leaving).slice(MAX_VISIBLE).map((t) => t.id));
          return overflow.size ? next.map((t) => (overflow.has(t.id) ? { ...t, leaving: true } : t)) : next;
        });
        return id;
      },
    [],
  );

  const value = useMemo<ToastContextValue>(
    () => ({ success: show("success"), error: show("error"), info: show("info"), dismiss }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Top-right stack, newest first; above the drawers (z-100) */}
      <section
        aria-label="Notifications"
        aria-live="polite"
        className="toast-viewport pointer-events-none fixed inset-x-4 top-4 z-200 flex flex-col md:inset-x-auto md:right-6 md:top-6 md:w-96"
      >
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </section>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
};
