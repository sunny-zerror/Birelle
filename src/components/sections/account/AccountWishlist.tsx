"use client";

import { useState } from "react";
import { Link } from "next-view-transitions";
import { RiCloseLine } from "@remixicon/react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { SIZES, formatPrice } from "@/data/products";
import type { Product } from "@/types";
import { ImageSkeleton } from "@/components/ui/skeleton";
import { AccountHeading, EmptyState, ease } from "./ui";

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

const AccountWishlist = () => {
  const { items } = useWishlist();

  return (
    <div className="account-wishlist">
      <AccountHeading
        title="Wishlist"
        description={
          items.length > 0
            ? `${items.length} saved ${items.length === 1 ? "piece" : "pieces"}. Choose a size to move one to your bag.`
            : undefined
        }
      />

      {items.length > 0 ? (
        <ul className="wishlist__list mt-8 grid grid-cols-2 gap-x-4 gap-y-12 md:mt-10 md:gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
          {items.map((product, i) => (
            <WishlistCard key={product.id} product={product} index={i} />
          ))}
        </ul>
      ) : (
        <EmptyState title="Your wishlist is empty" text="Tap the heart on any piece to save it here for later." />
      )}
    </div>
  );
};

export default AccountWishlist;
