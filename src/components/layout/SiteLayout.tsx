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
import { ZcomProvider } from "@zcom/storefront-kit/client";
import { CatalogProvider, type CatalogCategory } from "@/components/providers/CatalogProvider";
import { zcomConfig } from "@/zcom.config";
import type { Look, Product } from "@/types";
import { useEffect } from "react";

import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { ViewTransitions } from "next-view-transitions";

gsap.registerPlugin(ScrollTrigger);

type SiteLayoutProps = {
  children: React.ReactNode;
  products: Product[];
  categories: CatalogCategory[];
  looks: Look[];
};

export default function SiteLayout({ children, products, categories, looks }: SiteLayoutProps) {
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
        <ZcomProvider config={zcomConfig}>
        <CatalogProvider products={products} categories={categories} looks={looks}>
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
        </CatalogProvider>
        </ZcomProvider>
        </ToastProvider>
        </LoaderProvider>
      </LenisScroll>
    </ViewTransitions>

  );
}
