"use client";

import { useEffect, useState } from "react";
import { Link } from "next-view-transitions";
import {
  RiHandbagLine,
  RiHeartFill,
  RiHeartLine,
  RiSearchLine,
  RiUserLine,
} from "@remixicon/react";
import { siteConfig } from "@/config/site";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";

const actions = [{ label: "Account", href: "/account", Icon: RiUserLine }];

const iconClass = "center size-8 transition-opacity hover:opacity-60";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { count, open } = useCart();
  const { count: wishlistCount } = useWishlist();

  // Transparent over the hero, solid once the hero has scrolled past
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = document.querySelector<HTMLElement>("[data-hero]")?.offsetHeight ?? window.innerHeight;
      setIsScrolled(window.scrollY > heroHeight - 80);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50  transition-colors duration-500 ${
        isScrolled ? "bg-white text-ink" : "bg-transparent text-white mix-blend-difference"
      }`}
    >
      <div className="site-header__inner container grid h-header grid-cols-3 items-center">
        {/* Left: menu + search */}
        <div className="site-header__left flex items-center gap-2 md:gap-3">
          <button type="button" aria-label="Open menu" className={iconClass}>
            <span aria-hidden="true" className="flex w-4.5 flex-col gap-1.25">
              <span className="block h-px w-full bg-current" />
              <span className="block h-px w-full bg-current" />
            </span>
          </button>
          <button type="button" aria-label="Search" className={iconClass}>
            <RiSearchLine size={16} />
          </button>
        </div>

        {/* Centre: logo */}
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
            className={`block h-auto w-24 transition-[filter] duration-500 md:w-32 ${
              isScrolled ? "invert" : ""
            }`}
          />
        </Link>

        {/* Right: wishlist, account, bag */}
        <nav aria-label="Account" className="site-header__right flex items-center justify-self-end gap-1 md:gap-3">
          {/* Heart fills in once something is saved */}
          <Link
            href="/wishlist"
            aria-label={`Wishlist, ${wishlistCount} ${wishlistCount === 1 ? "item" : "items"}`}
            className={iconClass}
          >
            {wishlistCount > 0 ? (
              <RiHeartFill size={16} className="animate-panel-in" />
            ) : (
              <RiHeartLine size={16} />
            )}
          </Link>
          {actions.map(({ label, href, Icon }) => (
            <Link key={label} href={href} aria-label={label} className={iconClass}>
              <Icon size={16} />
            </Link>
          ))}
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
                <span className={isScrolled ? "text-white" : "text-ink"}>{count}</span>
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
