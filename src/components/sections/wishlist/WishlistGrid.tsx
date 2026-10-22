"use client";

import { useState } from "react";
import { Link } from "next-view-transitions";
import { RiCloseLine } from "@remixicon/react";
import Button from "@/components/ui/Button";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { SIZES, formatPrice } from "@/data/products";
import type { Product } from "@/types";
import { useHydrated } from "@/hooks/useHydrated";
import { ImageSkeleton, LoadingLabel, ProductCardSkeleton } from "@/components/ui/skeleton";

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";


// "Add to cart" opens into a size row; picking a size adds it and opens the bag
const WishlistCard = ({ product, index }: { product: Product; index: number }) => {
  const { add } = useCart();
  const { remove } = useWishlist();
  const [picking, setPicking] = useState(false);

  return (
    <li
      className="wishlist-card group relative flex animate-panel-in flex-col items-center"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <button
        type="button"
        aria-label={`Remove ${product.title} from wishlist`}
        onClick={() => remove(product.id)}
        className="absolute right-0 top-0 z-1 center size-8 text-ink transition-opacity duration-300 hover:opacity-60 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
      >
        <RiCloseLine size={16} />
      </button>

      <Link href={product.href} className="block w-full">
        <ImageSkeleton className="relative center aspect-3/4 overflow-hidden">
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className={`w-[80%] transition-transform duration-1000 ${ease} group-hover:scale-105`}
          />
        </ImageSkeleton>
        <div className="mt-4 text-center">
          <h2 className="secondary-font text-xs uppercase tracking-wide text-ink">{product.title}</h2>
          <p className="mt-1.5 text-xs text-ink">{formatPrice(product.price)}</p>
        </div>
      </Link>

      {/* Fixed-height slot so swapping button ↔ sizes never shifts the grid */}
      <div className="mt-5 h-9 w-full max-w-[13.5rem]">
        {picking ? (
          <div role="group" aria-label={`Choose a size for ${product.title}`} className="flex h-full animate-panel-in gap-1">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  add(product.id, s);
                  setPicking(false);
                }}
                className="center h-full flex-1 border border-ink/30 text-xs text-ink transition-colors duration-300 hover:border-deep hover:bg-deep hover:text-white"
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPicking(true)}
            className={`secondary-font h-full w-full bg-deep text-xs uppercase tracking-wide text-white transition-colors duration-500 ${ease} hover:bg-ink`}
          >
            Add to cart
          </button>
        )}
      </div>
    </li>
  );
};

const WishlistGrid = () => {
  const { items } = useWishlist();
  const hydrated = useHydrated();

  return (
    <section id="wishlist" className="wishlist bg-white pb-section pt-[calc(var(--spacing-header)+0.5rem)]">
      <div className="container">
        <h1 className="primary-font text-center text-3xl font-normal uppercase text-ink md:text-4xl">Wishlist</h1>

        {!hydrated && (
          <ul className="mt-stack grid grid-cols-2 gap-x-4 gap-y-12 md:mt-16 md:grid-cols-4 md:gap-x-8 md:gap-y-20">
            <LoadingLabel>Loading your wishlist</LoadingLabel>
            {Array.from({ length: 4 }, (_, i) => (
              <ProductCardSkeleton key={i} action />
            ))}
          </ul>
        )}
        {hydrated &&
          (items.length > 0 ? (
            <ul className="wishlist__list mt-stack grid grid-cols-2 gap-x-4 gap-y-12 md:mt-16 md:grid-cols-4 md:gap-x-8 md:gap-y-20">
              {items.map((product, i) => (
                <WishlistCard key={product.id} product={product} index={i} />
              ))}
            </ul>
          ) : (
            <div className="wishlist__empty flex min-h-[50vh] animate-panel-in flex-col items-center justify-center text-center">
              <p className="text-sm text-ink">Your wishlist is empty.</p>
              <p className="mt-2 max-w-[18rem] text-sm text-muted">
                Tap the heart on any piece to save it here for later.
              </p>
              <Button href="/shop" className="mt-8">
                Shop the collection
              </Button>
            </div>
          ))}
      </div>
    </section>
  );
};

export default WishlistGrid;
