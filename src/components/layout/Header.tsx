"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import {
  RiHandbagLine,
  RiHeartFill,
  RiHeartLine,
  RiSearchLine,
  RiUserFill,
  RiUserLine,
} from "@remixicon/react";
import { siteConfig } from "@/config/site";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import MenuDrawer from "@/components/layout/MenuDrawer";
import SearchOverlay from "@/components/layout/SearchOverlay";
import { useAuth } from "@/components/providers/AuthProvider";

const iconClass = "center size-8 transition-opacity hover:opacity-60";

// Pages whose hero sits under a transparent header, and the text tone that reads over it.
// Every other page gets a solid white header; the hairline border shows whenever it is solid.
const transparentRoutes: Record<string, "light" | "dark"> = {
  "/": "light", // white over the hero video
  "/about": "dark", // ink over the white about hero
};

const Header = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { count, open } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [panel, setPanel] = useState<"menu" | "search" | null>(null);
  const closePanel = useCallback(() => setPanel(null), []);
  const { user, requireAuth } = useAuth();

  const tone = transparentRoutes[pathname];
  const isSolid = !tone || isScrolled;
  const isLight = !isSolid && tone === "light";

  // Turns solid once 30% of the screen has scrolled by
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > window.innerHeight * 0.3);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return (
    <>
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 border-b transition-[background-color,color,border-color] duration-300 ${
        isSolid ? "border-black/10 bg-white" : "border-transparent bg-transparent"
      } ${isLight ? "text-white" : "text-ink"}`}
    >
      <div className="site-header__inner container grid py-4 grid-cols-3 items-center">
        {/* Left: menu + search */}
        <div className="site-header__left flex items-center gap-2 md:gap-8">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={panel === "menu"}
            onClick={() => setPanel("menu")}
            className="group flex h-8 items-center gap-2.5 transition-opacity hover:opacity-60"
          >
            {/* Second line stretches on hover */}
            <span aria-hidden="true" className="flex w-4.5 flex-col gap-1.25">
              <span className="block h-px w-full bg-current" />
              <span className="block h-px w-2/3 bg-current transition-[width] duration-500 group-hover:w-full" />
            </span>
            <span className="hidden text-sm md:inline">Menu</span>
          </button>
          <button
            type="button"
            aria-label="Search"
            aria-expanded={panel === "search"}
            onClick={() => setPanel("search")}
            className="flex h-8 items-center gap-2.5 transition-opacity hover:opacity-60"
          >
            <RiSearchLine size={16} />
            <span className="hidden text-sm md:inline">Search</span>
          </button>
        </div>

        {/* Centre: logo */}
        {/* On the home page the hero wordmark docks here instead, so this one stays invisible (still clickable) */}
        <Link
          href="/"
          aria-label={`${siteConfig.name} home`}
          className="site-header__logo justify-self-center transition-opacity hover:opacity-70"
        >
          <img
            src="/logo.svg"
            alt=""
            width={1307}
            height={127}
            className={`block h-auto w-24 transition-[filter] duration-150 md:w-32 ${
              isLight ? "" : "invert"
            } ${pathname === "/" ? "opacity-0" : ""}`}
          />
        </Link>

        {/* Right: wishlist, account, bag */}
        <nav aria-label="Account" className="site-header__right flex items-center justify-self-end gap-1 md:gap-3">
          {/* Heart fills in once something is saved */}
          <Link
            href="/account/wishlist"
            onClick={requireAuth("/account/wishlist")}
            aria-label={`Wishlist, ${wishlistCount} ${wishlistCount === 1 ? "item" : "items"}`}
            className={iconClass}
          >
            {wishlistCount > 0 ? (
              <RiHeartFill size={16} className="animate-panel-in" />
            ) : (
              <RiHeartLine size={16} />
            )}
          </Link>
          {/* Signed in: straight to the dashboard (filled icon). Signed out: the sign-in drawer */}
          <Link
            href="/account"
            onClick={requireAuth("/account")}
            aria-label={user ? `My account, signed in as ${user.firstName}` : "Sign in"}
            className={iconClass}
          >
            {user ? <RiUserFill size={16} className="animate-panel-in" /> : <RiUserLine size={16} />}
          </Link>
          <button
            type="button"
            aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
            onClick={open}
            className={`${iconClass} relative`}
          >
            <RiHandbagLine size={16} />
            {count > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-0 top-0.5 flex size-3.5 animate-panel-in items-center justify-center rounded-full bg-current text-[0.5625rem] leading-none"
              >
                <span className={isLight ? "text-ink" : "text-white"}>{count}</span>
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>

    {/* Outside the header so they cover the full screen independently */}
    <MenuDrawer isOpen={panel === "menu"} onClose={closePanel} />
    <SearchOverlay isOpen={panel === "search"} onClose={closePanel} />
    </>
  );
};

export default Header;
