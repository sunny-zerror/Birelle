"use client";

import { Link } from "next-view-transitions";
import { RiHeartFill, RiHeartLine } from "@remixicon/react";
import Button from "@/components/ui/Button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { products } from "@/data/products";
import { useWishlist } from "@/components/providers/WishlistProvider";

// Listed twice so loop mode always has enough slides on both sides
const slides = [...products, ...products];

// Side cards are 30% smaller than the centre card
const SIDE_SCALE = 0.7;

/**
 * Scales every slide by its distance from the centre and pulls the shrunken
 * cards inwards, so the gap between all cards stays equal to spaceBetween.
 */
const layoutSlides = (swiper: SwiperType) => {
  const gap = Number(swiper.params.spaceBetween) || 0;

  swiper.slides.forEach((slide) => {
    const width = slide.offsetWidth;
    const step = width + gap;
    // Distance from the viewport centre in slides (negative = left)
    const d = (slide.offsetLeft + swiper.translate + width / 2 - swiper.width / 2) / step;
    const abs = Math.abs(d);
    const scale = 1 - Math.min(abs, 1) * (1 - SIDE_SCALE);

    // Where the card centre should sit vs. where Swiper naturally puts it
    const first = width / 2 + gap + (width * SIDE_SCALE) / 2;
    const rest = width * SIDE_SCALE + gap;
    const target = abs <= 1 ? abs * first : first + (abs - 1) * rest;
    const shift = Math.sign(d) * target - d * step;

    slide.style.transform = `translate3d(${shift}px, 0, 0) scale(${scale})`;
  });
};

const setSlideTransition = (swiper: SwiperType, duration: number) => {
  swiper.slides.forEach((slide) => {
    slide.style.transitionDuration = `${duration}ms`;
  });
};

const HomeCurated = () => {
  const { has, toggle } = useWishlist();

  return (
    <section id="home-curated" className="home-curated section overflow-hidden bg-white">
      <div className="home-curated__head container flex items-baseline justify-between">
        <h2 className=" uppercase text-deep">Curated Selection</h2>
        <Button type="bracket" href="/shop">View All</Button>
      </div>

      <Swiper
        className="home-curated__slider mt-stack md:mt-24"
        modules={[Autoplay]}
        slidesPerView="auto"
        centeredSlides
        loop
        initialSlide={3}
        speed={900}
        spaceBetween={12}
        breakpoints={{ 768: { spaceBetween: 20 } }}
        autoplay={{ delay: 2000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        onAfterInit={layoutSlides}
        onResize={layoutSlides}
        onSetTranslate={layoutSlides}
        onSetTransition={setSlideTransition}
      >
        {slides.map((product, i) => (
          <SwiperSlide
            key={`${product.href}-${i}`}
            className="home-curated__slide w-[60vw]! origin-bottom md:w-[20vw]!"
          >
            <article className="group relative aspect-3/4 overflow-hidden ">
              <Link href={product.href} className="absolute inset-0" aria-label={product.title}>
                <img
                  src={product.image}
                  alt={product.title}
                  className="cover"
                  loading="lazy"
                />
                {/* Featured shot — always on the centre card, on hover elsewhere */}
                <img
                  src={product.featured}
                  alt=""
                  className="cover absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 in-[.swiper-slide-active]:opacity-100"
                  loading="lazy"
                />
                <span className="absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 in-[.swiper-slide-active]:opacity-100" />
              </Link>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-3 text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100 in-[.swiper-slide-active]:opacity-100">
                <h3 className="text-cta text-white!">{product.title}</h3>
                <button
                  type="button"
                  aria-label={`${has(product.id) ? "Remove" : "Add"} ${product.title} ${has(product.id) ? "from" : "to"} wishlist`}
                  aria-pressed={has(product.id)}
                  onClick={() => toggle(product.id)}
                  className="pointer-events-auto center size-6 transition-[opacity,transform] duration-300 hover:opacity-60 active:scale-90"
                >
                  {has(product.id) ? <RiHeartFill size={14} /> : <RiHeartLine size={14} />}
                </button>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HomeCurated;
