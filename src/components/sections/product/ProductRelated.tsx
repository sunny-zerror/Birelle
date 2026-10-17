"use client";

import { useState } from "react";
import { Link } from "next-view-transitions";
import { RiAddLine, RiCheckLine } from "@remixicon/react";
import { formatPrice } from "@/data/products";
import type { Product } from "@/types";
import { useCart } from "@/components/providers/CartProvider";

// 6 columns × 2 rows
const GRID_COUNT = 12;

const ProductRelated = ({ products }: { products: Product[] }) => {
  const { add } = useCart();
  // Brief tick after a quick add
  const [added, setAdded] = useState<string[]>([]);

  // Quick add uses the most common size; it can be changed in the cart
  const quickAdd = (id: string) => {
    add(id, "M");
    setAdded((prev) => [...prev, id]);
    window.setTimeout(() => setAdded((prev) => prev.filter((p) => p !== id)), 1800);
  };

  // Repeats the list to fill both rows while the dummy catalogue is small
  const items = products.length
    ? Array.from({ length: GRID_COUNT }, (_, i) => products[i % products.length])
    : [];

  return (
    <section id="pdp-related" className="pdp-related section overflow-hidden bg-white">
      <div className="container">
        <h2 className=" text-deep uppercase">You May Also Like</h2>
      </div>

      <ul className="container mt-stack grid grid-cols-2 gap-x-grid gap-y-10 md:mt-16 md:grid-cols-3 lg:grid-cols-6">
        {items.map((p, i) => {
          const isAdded = added.includes(p.id);
          return (
            <li key={`${p.id}-${i}`}>
              <article className="group text-center">
                <Link href={p.href} aria-label={p.title} className="block">
                  <div className="relative aspect-3/4 center overflow-hidden bg-white">
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      className="w-[80%] transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                  </div>
                </Link>
                <p className="mt-4 text-base text-ink">{formatPrice(p.price)}</p>
                <button
                  type="button"
                  aria-label={`Quick add ${p.title}`}
                  onClick={() => quickAdd(p.id)}
                  className="mx-auto mt-1 center size-7 text-ink transition-transform duration-500 hover:rotate-90"
                >
                  {isAdded ? <RiCheckLine size={16} /> : <RiAddLine size={16} />}
                </button>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default ProductRelated;
