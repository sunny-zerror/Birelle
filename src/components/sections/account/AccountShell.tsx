"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { useTransitionRouter } from "next-view-transitions";
import { RiLogoutBoxRLine } from "@remixicon/react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useHydrated } from "@/hooks/useHydrated";
import { useOrders } from "@/hooks/useOrders";
import { formatMonth } from "@/utils/date";
import { LoadingLabel, Skeleton } from "@/components/ui/skeleton";
import { accountNav, isActive } from "./nav";
import { ease } from "./ui";

const SignOutButton = ({ className = "" }: { className?: string }) => {
  const { signOut } = useAuth();
  return (
    <button
      type="button"
      onClick={signOut}
      className={`group flex items-center gap-3 text-sm text-ink transition-opacity duration-300 hover:opacity-60 ${className}`}
    >
      <RiLogoutBoxRLine size={16} className={`transition-transform duration-500 ${ease} group-hover:translate-x-0.5`} />
      <span className="link-line">Sign out</span>
    </button>
  );
};

// Same frame as the dashboard, in skeleton blocks, while the stored session is read
const ShellSkeleton = () => (
  <div className="container">
    <LoadingLabel>Loading your account</LoadingLabel>
    <div className="flex flex-col gap-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-10 w-72 md:h-14" />
      <Skeleton className="h-4 w-56" />
    </div>
    <div className={`${grid} mt-10 border-t border-line pt-8 md:mt-14 lg:pt-14`}>
      <div className="hidden flex-col gap-4 lg:flex">
        {accountNav.map((n) => (
          <Skeleton key={n.href} className="h-4 w-36" />
        ))}
      </div>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  </div>
);

const grid = "grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-20 xl:grid-cols-[17rem_minmax(0,1fr)]";

// Dashboard frame for every /account page: sign-in guard, side navigation, sign out.
// Desktop: title band, then a sticky numbered side list (as on the Legal pages) beside the tab.
// Mobile: scrolling tab row, sign out under the page.
const AccountShell = ({ children }: { children: React.ReactNode }) => {
  const { user, isReady, openLogin, isSigningOut } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const { orders } = useOrders();
  // Wait for a returning customer's session to be restored before deciding they're signed out
  const hydrated = useHydrated() && isReady;
  const pathname = usePathname();
  const router = useTransitionRouter();
  const navRef = useRef<HTMLOListElement>(null);

  // Signed out: back to the home page with the sign-in drawer open, returning here afterwards
  useEffect(() => {
    if (!hydrated || user || isSigningOut()) return;
    openLogin({ next: pathname });
    router.replace("/");
  }, [hydrated, user, pathname, openLogin, isSigningOut, router]);

  // Mobile: bring the current tab into view in the scrolling row
  useEffect(() => {
    navRef.current
      ?.querySelector<HTMLElement>("[aria-current=page]")
      ?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [pathname]);

  const counts: Record<string, number> = {
    "/account/orders": orders.length,
    "/account/wishlist": wishlistCount,
  };

  return (
    <section className="account bg-white pb-section pt-[calc(var(--spacing-header)+2.5rem)] md:pt-[calc(var(--spacing-header)+4.5rem)]">
      {!hydrated || !user ? (
        <ShellSkeleton />
      ) : (
        <div className="container">
          {/* Title band — same as the Contact and Legal pages */}
          <header className="account-intro max-w-3xl animate-panel-in">
            <p className="text-xs uppercase tracking-wide text-muted">My account</p>
            <h1 className="primary-font mt-4 truncate text-3xl font-normal uppercase text-ink md:text-5xl">Hello, {user.firstName}</h1>
            <p className="mt-5 truncate text-sm leading-relaxed text-muted md:text-base">
              {user.email} · Member since {formatMonth(user.createdAt)}
            </p>
          </header>

          <div className={`${grid} mt-10 border-t border-line pt-8 md:mt-14 lg:pt-14`}>
            {/* Side navigation — stays put while the tab beside it changes */}
            <aside className="account-sidebar lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:self-start">
              <nav aria-label="Account">
                <p className="secondary-font mb-4 hidden text-xs uppercase tracking-wide text-muted lg:block">Your account</p>
                <ol
                  ref={navRef}
                  className="scroller_none -mx-gutter flex gap-7 overflow-x-auto border-b border-line px-gutter lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-b-0 lg:border-l lg:px-0"
                >
                  {accountNav.map(({ label, href }, i) => {
                    const active = isActive(pathname, href);
                    const count = counts[href];
                    return (
                      <li key={href} className="shrink-0">
                        {/* A plain Next link: switching tabs swaps only the content column, without the page-wide fade */}
                        <NextLink
                          href={href}
                          scroll={false}
                          aria-current={active ? "page" : undefined}
                          className={`relative flex items-center gap-3 whitespace-nowrap pb-3.5 text-sm transition-colors duration-300 lg:-ml-px lg:border-l lg:py-2.5 lg:pl-4 ${
                            active ? "text-ink lg:border-ink" : "text-muted hover:text-ink lg:border-transparent"
                          }`}
                        >
                          {label}
                          {count > 0 && (
                            <span className="text-xs tabular-nums text-muted lg:ml-auto">
                              <span className="sr-only">(</span>
                              {count}
                              <span className="sr-only">)</span>
                            </span>
                          )}
                          {/* Mobile underline */}
                          <span
                            aria-hidden="true"
                            className={`absolute inset-x-0 -bottom-px h-px origin-left bg-ink transition-transform duration-500 lg:hidden ${ease} ${
                              active ? "scale-x-100" : "scale-x-0"
                            }`}
                          />
                        </NextLink>
                      </li>
                    );
                  })}
                </ol>
              </nav>

              <div className="mt-10 hidden border-t border-line pt-6 lg:block">
                <SignOutButton />
              </div>
            </aside>

            {/* Current tab — the only part that animates on a tab change */}
            <div className="account-content min-w-0">
              <div key={pathname} className="animate-panel-in">
                {children}
              </div>

              <div className="mt-section border-t border-line pt-6 lg:hidden">
                <SignOutButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AccountShell;
