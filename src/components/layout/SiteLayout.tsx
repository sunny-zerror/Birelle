"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LenisScroll from "@/components/providers/LenisScroll";
import { CartProvider } from "@/components/providers/CartProvider";
import { WishlistProvider } from "@/components/providers/WishlistProvider";
import CartDrawer from "@/components/layout/CartDrawer";
import AccountDrawer from "@/components/layout/AccountDrawer";
import { AuthProvider } from "@/components/providers/AuthProvider";
import Loader from "@/components/layout/Loader";
import { LoaderProvider } from "@/components/providers/LoaderProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { ViewTransitions } from "next-view-transitions";

gsap.registerPlugin(ScrollTrigger);

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    window.history.scrollRestoration = "manual";
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (window.lenis) {
      window.lenis.scrollTo(0, {
        immediate: true,
        force: true,
      });
    }

    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();

      if (window.lenis) {
        window.lenis.resize();
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <ViewTransitions>
      <LenisScroll>
        <LoaderProvider>
        <ToastProvider>
        <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <CartDrawer />
            <AccountDrawer />
            <Loader />
          </WishlistProvider>
        </CartProvider>
        </AuthProvider>
        </ToastProvider>
        </LoaderProvider>
      </LenisScroll>
    </ViewTransitions>

  );
}
