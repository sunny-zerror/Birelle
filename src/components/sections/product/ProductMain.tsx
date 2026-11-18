"use client";

import { useRef, useState } from "react";
import { Link } from "next-view-transitions";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { RiArrowLeftSLine, RiCheckLine, RiHeartFill, RiHeartLine, RiShareForwardLine } from "@remixicon/react";
import { formatPrice, getColours, getSizes, swatchFor } from "@/data/products";
import { ONE_SIZE, isSizeAvailable } from "@/lib/zcom/adapters";
import type { Product } from "@/types";
import { ImageSkeleton } from "@/components/ui/skeleton";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useToast } from "@/components/providers/ToastProvider";

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
  const toast = useToast();
  const sizes = getSizes(product);
  // One-size pieces are ready to add straight away
  const [size, setSize] = useState<string | null>(sizes.length === 1 && sizes[0] === ONE_SIZE ? ONE_SIZE : null);
  const colours = getColours(product);
  const [colour, setColour] = useState(product.colour);
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
    add(product.id, size, colour);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.title, url }).catch(() => {});
    } else {
      await navigator.clipboard
        ?.writeText(url)
        .then(() => toast.success("Link copied"))
        .catch(() => toast.error("Couldn't copy the link"));
    }
  };

  return (
    <section ref={sectionRef} id="pdp-main" className="pdp-main bg-white md:grid md:grid-cols-2">
      {/* Gallery — scrolls past while the info column stays put */}
      <div className="pdp-gallery flex flex-col gap-1 bg-[#F7F7F7]">
        {[product.image, product.featured].map((src, i) => (
          <ImageSkeleton key={src} className="pdp-gallery__item relative flex aspect-3/4 items-center justify-center overflow-hidden md:aspect-auto md:h-screen">
            <img
              src={src}
              alt={i === 0 ? product.title : `${product.title} styled on model`}
              // Packshot sits centred at 80% width; the model shot fills the frame
              className={i === 0 ? "max-h-full w-[60%] object-contain" : "cover"}
              fetchPriority={i === 0 ? "high" : undefined}
              loading={i === 0 ? undefined : "lazy"}
            />
          </ImageSkeleton>
        ))}
      </div>

      {/* Info */}
      <div className="pdp-info relative">
        <div className="sticky top-0 flex min-h-screen flex-col px-gutter pb-16 pt-8 md:pt-[calc(var(--spacing-header))]">

          <div className="mx-auto flex w-full max-w-[30rem] flex-1 flex-col items-stretch justify-center pt-12 text-left">
            {product.isNew && <p className="pdp-reveal text-sm text-ink">New In</p>}
            {/* Name and price on one line */}
            <div className="pdp-reveal mt-3 flex items-baseline justify-between gap-6">
              <h1 className="primary-font text-2xl font-normal uppercase leading-tight text-ink">{product.title}</h1>
              <p className="shrink-0 text-base tabular-nums text-ink">{formatPrice(product.price)}</p>
            </div>

            {/* Colours — label left, swatches right (only for pieces that come in colours) */}
            {colours.length > 0 && (
            <div className="pdp-reveal mt-8 flex items-center justify-between gap-6 border-t border-line pt-5">
            <p className="text-base text-ink">
              Colour: <span className="ml-1">{colour}</span>
            </p>
            <div role="radiogroup" aria-label="Colour" className="flex gap-2.5">
              {colours.map((c) => {
                const on = c === colour;
                return (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={c}
                    title={c}
                    onClick={() => setColour(c)}
                    className={`center size-7 rounded-full border transition-colors duration-300 ${
                      on ? "border-ink" : "border-transparent hover:border-ink/30"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="size-5 rounded-full ring-1 ring-ink/10"
                      style={{ background: swatchFor(c) }}
                    />
                  </button>
                );
              })}
            </div>
            </div>
            )}

            {/* Sizes — label left, options right */}
            <div className="pdp-reveal mt-4 flex items-center justify-between gap-6 border-t border-line pt-4">
            <p className="text-base text-ink">Size</p>
            <div role="radiogroup" aria-label="Size" className="-mr-3 flex gap-1">
              {sizes.map((s) => {
                const on = s === size;
                // Sold out in this colour: shown, but can't be picked
                const soldOut = !isSizeAvailable(product, s, colour);
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={soldOut}
                    title={soldOut ? `${s} — sold out` : undefined}
                    onClick={() => {
                      setSize(s);
                      setNeedsSize(false);
                    }}
                    className={`group relative center h-8 text-sm text-ink disabled:cursor-not-allowed disabled:line-through disabled:opacity-35 ${s.length > 3 ? "px-3" : "w-10"}`}
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
            </div>
            <p
              aria-live="polite"
              className={`h-5 pt-1 text-right text-xs text-accent transition-opacity duration-300 ${needsSize ? "opacity-100" : "opacity-0"}`}
            >
              {needsSize ? "Please select a size" : ""}
            </p>

            {/* Add to cart + wishlist */}
            <div className="pdp-reveal mt-3 flex w-full gap-2">
            <button
              type="button"
              onClick={addToCart}
              className={`relative h-11 flex-1 overflow-hidden text-xs uppercase tracking-wider text-ink transition-colors duration-500 ${
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
            <button
              type="button"
              aria-label={wishlisted ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
              aria-pressed={wishlisted}
              onClick={() => wishlist.toggle(product.id)}
              className="center size-11 shrink-0 border border-ink/20 text-ink transition-colors duration-300 hover:border-ink active:scale-95"
            >
              {wishlisted ? <RiHeartFill size={18} className="animate-panel-in" /> : <RiHeartLine size={18} />}
            </button>
            </div>

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
