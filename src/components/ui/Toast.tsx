"use client";

import {
  RiCheckboxCircleLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiInformationLine,
  type RemixiconComponentType,
} from "@remixicon/react";

export type ToastType = "success" | "error" | "info";

export type ToastData = {
  id: number;
  type: ToastType;
  title: string;
  description?: string;
  duration: number;
  leaving: boolean;
};

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// Brand tones: forest for success, danger for error, deep slate for info
const tones: Record<ToastType, { Icon: RemixiconComponentType; text: string; bg: string; label: string }> = {
  success: { Icon: RiCheckboxCircleLine, text: "text-forest", bg: "bg-forest", label: "Success" },
  error: { Icon: RiErrorWarningLine, text: "text-danger", bg: "bg-danger", label: "Error" },
  info: { Icon: RiInformationLine, text: "text-deep", bg: "bg-deep", label: "Info" },
};

type Props = { toast: ToastData; onDismiss: (id: number) => void };

// White card with a tone bar on the left and a hairline timer along the bottom.
// The timer is a CSS animation, so hovering or focusing the card simply pauses it.
const Toast = ({ toast, onDismiss }: Props) => {
  const { Icon, text, bg, label } = tones[toast.type];
  const timed = Number.isFinite(toast.duration);

  return (
    // Collapses its height once leaving so the toasts below glide up. Clips vertically only,
    // so the card can still slide out past the right edge.
    <div
      className={`grid overflow-x-visible overflow-y-clip transition-[grid-template-rows] duration-500 ${ease} ${
        toast.leaving ? "grid-rows-[0fr] delay-100" : "grid-rows-[1fr]"
      }`}
    >
      <div className="min-h-0">
        <div
          role={toast.type === "error" ? "alert" : "status"}
          className={`toast group pointer-events-auto relative mb-3 flex gap-3 overflow-hidden border border-line bg-white py-4 pl-5 pr-3 text-ink shadow-[0_12px_40px_rgba(0,0,0,0.08)] motion-reduce:animate-none ${
            toast.leaving ? "animate-toast-out" : "animate-toast-in"
          }`}
        >
          <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-0.5 ${bg}`} />

          <Icon size={18} aria-hidden="true" className={`mt-px shrink-0 ${text}`} />

          <div className="min-w-0 flex-1">
            <p className="secondary-font text-sm font-medium leading-snug">
              <span className="sr-only">{label}: </span>
              {toast.title}
            </p>
            {toast.description && <p className="mt-1.5 text-xs leading-relaxed text-muted">{toast.description}</p>}
          </div>

          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => onDismiss(toast.id)}
            className="center -mt-1 size-6 shrink-0 text-ink transition-transform duration-500 hover:rotate-90"
          >
            <RiCloseLine size={16} />
          </button>

          {timed && !toast.leaving && (
            <span
              aria-hidden="true"
              onAnimationEnd={() => onDismiss(toast.id)}
              style={{ animationDuration: `${toast.duration}ms` }}
              className={`absolute inset-x-0 bottom-0 h-px origin-left animate-toast-timer opacity-60 group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] ${bg}`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Toast;
