"use client";

import { useBackInStockConfirmPage, useReviewUnsubscribePage, useUnsubscribePage } from "@zcom/storefront-kit/client";
import NoticePage from "@/components/sections/notice/NoticePage";

const NewsletterUnsubscribe = () => {
  const state = useUnsubscribePage();
  return (
    <NoticePage eyebrow="Emails" title={state === "working" ? "One moment" : "You're unsubscribed"} action={{ href: "/", label: "Back to the shop" }}>
      <p>{state === "working" ? "Updating your preferences…" : "You won't receive our newsletter at this address any more."}</p>
    </NoticePage>
  );
};

const ReviewUnsubscribe = () => {
  const state = useReviewUnsubscribePage();
  return (
    <NoticePage eyebrow="Emails" title={state === "working" ? "One moment" : "You're unsubscribed"} action={{ href: "/", label: "Back to the shop" }}>
      <p>{state === "working" ? "Updating your preferences…" : "We won't ask you to review your orders by email any more."}</p>
    </NoticePage>
  );
};

const BackInStockConfirm = () => {
  const state = useBackInStockConfirmPage();
  if (state === "working") {
    return (
      <NoticePage eyebrow="Notify me" title="One moment">
        <p>Confirming your alerts…</p>
      </NoticePage>
    );
  }
  return state === "done" ? (
    <NoticePage eyebrow="Notify me" title="You're all set" action={{ href: "/shop", label: "Keep shopping" }}>
      <p>We&apos;ll email you as soon as the pieces you asked about are back in stock.</p>
    </NoticePage>
  ) : (
    <NoticePage eyebrow="Notify me" title="Link expired" action={{ href: "/shop", label: "Back to the shop" }}>
      <p>This link has expired, was already used or was replaced by a newer one.</p>
    </NoticePage>
  );
};

/** Pages opened from store emails; each reads its token once and strips it from the address bar */
export const TokenNotice = ({ kind }: { kind: "newsletter" | "review" | "back-in-stock" }) =>
  kind === "newsletter" ? <NewsletterUnsubscribe /> : kind === "review" ? <ReviewUnsubscribe /> : <BackInStockConfirm />;
