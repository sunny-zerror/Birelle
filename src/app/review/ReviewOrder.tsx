"use client";

import { useEffect, useState } from "react";
import { useReviewLink } from "@zcom/storefront-kit/client";
import { getErrorMessage, takeQueryParams } from "@zcom/storefront-kit/core";
import { TextArea } from "@/components/ui/form";
import NoticePage from "@/components/sections/notice/NoticePage";
import { useHydrated } from "@/hooks/useHydrated";
import { ImageSkeleton } from "@/components/ui/skeleton";

type Draft = { rating: number; comment: string };

const Stars = ({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) => (
  <div role="radiogroup" aria-label={label} className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        role="radio"
        aria-checked={value === n}
        aria-label={`${n} star${n > 1 ? "s" : ""}`}
        onClick={() => onChange(n)}
        className={`text-xl leading-none transition-opacity ${n <= value ? "text-ink" : "text-ink/25 hover:text-ink/50"}`}
      >
        ★
      </button>
    ))}
  </div>
);

// Reviews from the order email link: one rating + comment per product
const ReviewOrder = () => {
  // Read the link's token once, then take it out of the address bar
  const [token] = useState(() => (typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("token")));
  useEffect(() => {
    takeQueryParams(["token"] as const);
  }, []);
  const ready = useHydrated();

  const { order, loading, error, submit } = useReviewLink(token);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [submitError, setSubmitError] = useState("");

  if (!ready || loading) {
    return (
      <NoticePage eyebrow="Reviews" title="One moment">
        <p>Loading your order…</p>
      </NoticePage>
    );
  }

  if (!token || error || !order) {
    return (
      <NoticePage eyebrow="Reviews" title="Link expired" action={{ href: "/", label: "Back to the shop" }}>
        <p>This review link is invalid or has expired.</p>
      </NoticePage>
    );
  }

  if (state === "done") {
    return (
      <NoticePage eyebrow="Reviews" title="Thank you" action={{ href: "/shop", label: "Keep shopping" }}>
        <p>Your reviews were sent. They appear on the site once the store has checked them.</p>
      </NoticePage>
    );
  }

  const set = (productId: string, patch: Partial<Draft>) =>
    setDrafts((d) => ({ ...d, [productId]: { ...{ rating: 0, comment: "" }, ...d[productId], ...patch } }));

  return (
    <NoticePage eyebrow={order.orderNo ? `Order ${order.orderNo}` : "Reviews"} title="How was your order?">
      <form
        noValidate
        className="mt-4 flex flex-col gap-8 text-left"
        onSubmit={async (e) => {
          e.preventDefault();
          const items = Object.entries(drafts)
            .filter(([, d]) => d.rating > 0)
            .map(([productId, d]) => ({ productId, rating: d.rating, comment: d.comment.trim() || undefined }));
          if (items.length === 0) {
            setSubmitError("Rate at least one piece.");
            return;
          }
          setState("sending");
          try {
            await submit(items);
            setState("done");
          } catch (err) {
            setSubmitError(getErrorMessage(err));
            setState("idle");
          }
        }}
      >
        {order.items.map((item) => (
          <div key={item.productId} className="flex gap-4">
            {item.imageUrl && (
              <ImageSkeleton className="aspect-3/4 w-16 shrink-0">
                <img src={item.imageUrl} alt="" className="size-full object-contain" />
              </ImageSkeleton>
            )}
            <div className="flex flex-1 flex-col gap-3">
              <p className="primary-font text-[0.9375rem] text-ink">{item.name}</p>
              <Stars label={`Rating for ${item.name}`} value={drafts[item.productId]?.rating ?? 0} onChange={(n) => set(item.productId, { rating: n })} />
              <TextArea
                label="Your review (optional)"
                value={drafts[item.productId]?.comment ?? ""}
                onChange={(v: string) => set(item.productId, { comment: v })}
              />
            </div>
          </div>
        ))}
        {submitError && <p className="text-xs text-danger">{submitError}</p>}
        <button
          type="submit"
          disabled={state === "sending"}
          className="secondary-font h-12 w-full bg-forest text-sm tracking-wide text-white transition-colors duration-500 hover:bg-ink disabled:opacity-70"
        >
          {state === "sending" ? "Sending…" : "Send reviews"}
        </button>
      </form>
    </NoticePage>
  );
};

export default ReviewOrder;
