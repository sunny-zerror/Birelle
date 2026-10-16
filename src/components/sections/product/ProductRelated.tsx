"use client";

import { useState } from "react";
import { Link } from "next-view-transitions";
import { RiAddLine, RiCheckLine } from "@remixicon/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import { formatPrice } from "@/data/products";
import type { Product } from "@/types";
import { useCart } from "@/components/providers/CartProvider";

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

  return (
    <section id="pdp-related" className="pdp-related section overflow-hidden bg-white">
      <div className="container">
        <h2 className=" text-deep uppercase">You May Also Like</h2>
      </div>

      <Swiper
        className="mt-stack md:mt-16"
        modules={[FreeMode]}
        freeMode={{ enabled: true, momentumRatio: 0.6 }}
        slidesPerView={1.6}
        spaceBetween={16}
        slidesOffsetBefore={16}
        slidesOffsetAfter={16}
        breakpoints={{
          768: { slidesPerView: 5, spaceBetween: 32, slidesOffsetBefore: 56, slidesOffsetAfter: 56 },
        }}
      >
        {products.map((p) => {
          const isAdded = added.includes(p.id);
          return (
            <SwiperSlide key={p.id}>
              <article className="group text-center">
                <Link href={p.href} aria-label={p.title} className="block">
                  <div className="relative aspect-3/4 overflow-hidden bg-white">
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      className="cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
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
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
};

export default ProductRelated;
