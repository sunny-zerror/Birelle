"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Link, useTransitionRouter } from "next-view-transitions";
import { RiLogoutBoxRLine } from "@remixicon/react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useHydrated } from "@/hooks/useHydrated";
import { useOrders } from "@/hooks/useOrders";
import { LoadingLabel, Skeleton } from "@/components/ui/skeleton";
import { accountNav, isActive } from "./nav";
import { ease } from "./ui";

const SignOutButton = ({ className = "" }: { className?: string }) => {
  const { signOut } = useAuth();
  return (
    <button
      type="button"
      onClick={signOut}
      className={`group flex items-center gap-3 text-sm text-ink transition-colors duration-300 hover:text-danger ${className}`}
    >
      <RiLogoutBoxRLine size={16} className={`transition-transform duration-500 ${ease} group-hover:translate-x-0.5`} />
      Sign out
    </button>
  );
};

// Same grid as the dashboard, in skeleton blocks, while the stored session is read
const ShellSkeleton = () => (
  <div className="container grid gap-8 md:grid-cols-[13rem_1fr] md:gap-12 lg:grid-cols-[15rem_1fr] lg:gap-20">
    <LoadingLabel>Loading your account</LoadingLabel>
    <div className="flex flex-col gap-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-40" />
      <div className="mt-6 hidden flex-col gap-4 md:flex">
        {accountNav.map((n) => (
          <Skeleton key={n.href} className="h-4 w-32" />
        ))}
      </div>
    </div>
    <div className="flex flex-col gap-6">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  </div>
);

// Dashboard frame for every /account page: sign-in guard, side navigation, sign out.
// Desktop: sticky sidebar with sign out pinned to its foot. Mobile: scrolling tab row, sign out under the page.
const AccountShell = ({ children }: { children: React.ReactNode }) => {
  const { user, isReady, openLogin, isSigningOut } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const { orders } = useOrders();
  // Wait for a returning customer's session to be restored before deciding they're signed out
  const hydrated = useHydrated() && isReady;
  const pathname = usePathname();
  const router = useTransitionRouter();
  const navRef = useRef<HTMLUListElement>(null);

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
    <section className="account bg-white pb-section pt-[calc(var(--spacing-header)+1.5rem)] md:pt-[calc(var(--spacing-header)+3.5rem)]">
      {!hydrated || !user ? (
        <ShellSkeleton />
      ) : (
        <div className="container grid gap-8 md:grid-cols-[13rem_1fr] md:gap-12 lg:grid-cols-[15rem_1fr] lg:gap-20">
          {/* Sidebar */}
          <aside className="account-sidebar md:sticky md:top-[calc(var(--spacing-header)+3.5rem)] md:flex md:h-[calc(100svh-var(--spacing-header)-7rem)] md:min-h-104 md:flex-col md:self-start">
            <div className="animate-panel-in">
              <p className="text-xs uppercase tracking-wide text-muted">My account</p>
              <p className="primary-font mt-2 truncate text-2xl text-ink md:text-[1.75rem]">Hello, {user.firstName}</p>
              <p className="mt-1.5 truncate text-xs text-muted">{user.email}</p>
            </div>

            <nav aria-label="Account" className="mt-8 md:mt-10">
              <ul
                ref={navRef}
                className="scroller_none -mx-gutter flex gap-7 overflow-x-auto border-b border-line px-gutter md:mx-0 md:flex-col md:gap-0 md:overflow-visible md:border-b-0 md:border-l md:px-0"
              >
                {accountNav.map(({ label, href, Icon }) => {
                  const active = isActive(pathname, href);
                  const count = counts[href];
                  return (
                    <li key={href} className="shrink-0">
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={`relative flex items-center gap-3 whitespace-nowrap pb-3.5 text-sm transition-colors duration-300 md:-ml-px md:border-l md:py-3 md:pl-5 ${
                          active ? "text-ink md:border-ink" : "text-muted hover:text-ink md:border-transparent"
                        }`}
                      >
                        <Icon size={16} aria-hidden="true" className="hidden shrink-0 md:block" />
                        {label}
                        {count > 0 && (
                          <span className="text-xs tabular-nums text-muted md:ml-auto">
                            <span className="sr-only">(</span>
                            {count}
                            <span className="sr-only">)</span>
                          </span>
                        )}
                        {/* Mobile underline */}
                        <span
                          aria-hidden="true"
                          className={`absolute inset-x-0 -bottom-px h-px origin-left bg-ink transition-transform duration-500 md:hidden ${ease} ${
                            active ? "scale-x-100" : "scale-x-0"
                          }`}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-auto hidden border-t border-line pt-6 md:block">
              <SignOutButton />
            </div>
          </aside>

          {/* Current tab */}
          <div className="account-content min-w-0">
            <div key={pathname} className="animate-panel-in">
              {children}
            </div>

            <div className="mt-section border-t border-line pt-6 md:hidden">
              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AccountShell;
