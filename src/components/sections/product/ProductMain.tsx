"use client";

import { useRef, useState } from "react";
import { Link } from "next-view-transitions";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { RiArrowLeftSLine, RiCheckLine, RiHeartFill, RiHeartLine, RiShareForwardLine } from "@remixicon/react";
import { SIZES, formatPrice } from "@/data/products";
import type { Product } from "@/types";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";

gsap.registerPlugin(useGSAP);

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// Dummy copy for the info drawers
const details = [
  {
    title: "Size Guide",
    body: "Relaxed, true-to-size fit. Model is 188cm and wears size M. For an oversized silhouette, take one size up.",
  },
  {
    title: "Shipping, Exchange & Returns",
    body: "Complimentary express shipping on orders over $250. Exchanges and returns are accepted within 14 days of delivery, unworn and with original tags.",
  },
  {
    title: "Customer Service",
    body: "Our client advisors are available Monday to Friday, 9am – 6pm, to help with sizing, orders and styling.",
  },
];

const ProductMain = ({ product }: { product: Product }) => {
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const wishlist = useWishlist();
  const wishlisted = wishlist.has(product.id);
  const [openDetail, setOpenDetail] = useState<number | null>(null);
  const [needsSize, setNeedsSize] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);

  // Gallery fades up, info column staggers in
  useGSAP(
    () => {
      gsap.from(".pdp-gallery__item", { opacity: 0, scale: 1.04, duration: 1.4, ease: "power3.out", stagger: 0.15 });
      gsap.from(".pdp-reveal", { opacity: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.06, delay: 0.2 });
    },
    { scope: sectionRef },
  );

  const addToCart = () => {
    if (!size) {
      setNeedsSize(true);
      return;
    }
    add(product.id, size);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.title, url }).catch(() => {});
    } else {
      await navigator.clipboard?.writeText(url);
    }
  };

  return (
    <section ref={sectionRef} id="pdp-main" className="pdp-main bg-white md:grid md:grid-cols-2">
      {/* Gallery — scrolls past while the info column stays put */}
      <div className="pdp-gallery flex flex-col gap-1 bg-[#F7F7F7]">
        {[product.image, product.featured].map((src, i) => (
          <div key={src} className="pdp-gallery__item relative aspect-3/4 overflow-hidden md:aspect-auto md:h-screen">
            <img
              src={src}
              alt={i === 0 ? product.title : `${product.title} styled on model`}
              className="cover"
              fetchPriority={i === 0 ? "high" : undefined}
              loading={i === 0 ? undefined : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="pdp-info relative">
        <div className="sticky top-0 flex min-h-screen flex-col px-gutter pb-16 pt-8 md:pt-[calc(var(--spacing-header))]">
          <div className="pdp-reveal flex items-center justify-between">
            <Link
              href="/shop"
              className="group inline-flex text-sm items-center gap-1  text-ink transition-opacity hover:opacity-60"
            >
              <RiArrowLeftSLine size={14} className={`transition-transform duration-500 ${ease} group-hover:-translate-x-1`} />
              Collection 2026
            </Link>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={wishlisted}
                onClick={() => wishlist.toggle(product.id)}
                className="center size-8 transition-transform duration-300 active:scale-90"
              >
                {wishlisted ? <RiHeartFill size={17} /> : <RiHeartLine size={17} />}
              </button>
              <button type="button" aria-label="Share" onClick={share} className="center size-8 transition-opacity hover:opacity-60">
                <RiShareForwardLine size={17} />
              </button>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[30rem] flex-1 flex-col items-center justify-center pt-12 text-center">
            {product.isNew && <p className="pdp-reveal text-sm text-ink">New In</p>}
            <h1 className="pdp-reveal primary-font mt-3 text-2xl font-normal uppercase leading-tight text-ink">
              {product.title}
            </h1>
            <p className="pdp-reveal mt-6 text-base text-ink">{formatPrice(product.price)}</p>

            <p className="pdp-reveal mt-6 text-base text-ink">
              Colour: <span className="ml-1 inline-block size-1.5 rounded-full bg-neutral-400 align-middle" />{" "}
              {product.colour}
            </p>

            {/* Sizes */}
            <div role="radiogroup" aria-label="Size" className="pdp-reveal mt-5 flex gap-1">
              {SIZES.map((s) => {
                const on = s === size;
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => {
                      setSize(s);
                      setNeedsSize(false);
                    }}
                    className="group relative center h-8 w-10 text-sm text-ink"
                  >
                    {s}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-3 bottom-1 h-px origin-center bg-current transition-transform duration-500 ${ease} ${
                        on ? "scale-x-100" : "scale-x-0 group-hover:scale-x-60"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p
              aria-live="polite"
              className={`h-5 pt-1 text-xs text-accent transition-opacity duration-300 ${needsSize ? "opacity-100" : "opacity-0"}`}
            >
              {needsSize ? "Please select a size" : ""}
            </p>

            {/* Add to cart */}
            <button
              type="button"
              onClick={addToCart}
              className={`pdp-reveal relative mt-3 h-11 w-full overflow-hidden text-xs uppercase tracking-wider text-ink transition-colors duration-500 ${
                added ? "bg-deep text-white" : "bg-[#b9c7cf] hover:bg-deep hover:text-white"
              }`}
            >
              <span
                className={`absolute inset-0 center transition-[translate,opacity] duration-500 ${ease} ${
                  added ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
                }`}
              >
                Add to Cart
              </span>
              <span
                aria-live="polite"
                className={`absolute inset-0 center gap-1.5 transition-[translate,opacity] duration-500 ${ease} ${
                  added ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                }`}
              >
                <RiCheckLine size={14} /> {added ? `Added — size ${size}` : ""}
              </span>
            </button>

            <p className="pdp-reveal mt-8 text-left  text-ink">{product.description}</p>

            {/* Info drawers */}
            <ul className="pdp-reveal mt-12 w-full text-left">
              {details.map((d, i) => {
                const open = openDetail === i;
                return (
                  <li key={d.title}>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenDetail(open ? null : i)}
                      className="flex w-full items-center justify-between py-2.5 text-sm font-medium uppercase text-ink "
                    >
                      <p className="underline underline-offset-4">
                      {d.title}
                      </p>
                      <span aria-hidden="true" className={`text-base   transition-transform duration-500 ${ease} ${open ? "rotate-45" : ""}`}>
                        +
                      </span>
                    </button>
                    <div className={`grid transition-[grid-template-rows] duration-500 ${ease} ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                      <p className="overflow-hidden text-sm  text-muted" inert={!open}>
                        <span className="block pb-3">{d.body}</span>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductMain;
