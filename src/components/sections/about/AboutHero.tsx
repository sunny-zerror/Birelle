"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ImageSkeleton } from "@/components/ui/skeleton";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const AboutHero = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Title + tagline rise in on load
      gsap.from(".about-hero__reveal", { yPercent: 40, opacity: 0, duration: 1.2, ease: "power3.out", stagger: 0.12 });

      // Frame opens from a centred crop, then the photo keeps settling as it scrolls past
      gsap.fromTo(
        ".about-hero__media",
        { clipPath: "inset(12% 18% 12% 18%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "power3.inOut", delay: 0.3 },
      );
      gsap.fromTo(
        ".about-hero__media img",
        { scale: 1.2 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: ".about-hero__media", start: "top bottom", end: "bottom top", scrub: true },
        },
      );

      gsap.from(".about-hero__intro", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".about-hero__intro", start: "top 90%" },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="about-hero"
      data-hero
      className="about-hero bg-white pb-section pt-[calc(var(--spacing-header)+2.5rem)] md:pt-[calc(var(--spacing-header)+1rem)]"
    >
      <div className="container">
        <header className="flex flex-col items-center overflow-hidden text-center">
          <h1 className="about-hero__reveal primary-font text-[3rem] font-normal uppercase leading-[0.95] text-deep md:text-[4.5rem]">
            About
            <br />
            Birelle
          </h1>
          <p className="about-hero__reveal mt-4 text-sm uppercase tracking-wide text-ink">No More Walls</p>
        </header>

        <ImageSkeleton className="about-hero__media relative mx-auto mt-10 aspect-video overflow-hidden bg-neutral-200 md:mt-14">
          <img
            src="/images/aboutpage/webp/hero.webp"
            alt="Hands guiding a hand-painted cream garment through a sewing machine"
            className="cover will-change-transform"
            fetchPriority="high"
          />
        </ImageSkeleton>

        <p className="about-hero__intro mx-auto mt-stack max-w-[32rem] text-center text-sm  text-ink md:mt-20">
          <strong className="font-semibold">BIRELLE</strong> is a contemporary clothing brand built around the
          relationship between art and everyday expression. Through colour, imagery and relaxed silhouettes, each
          collection explores a different way of seeing and wearing the world.
        </p>
      </div>
    </section>
  );
};

export default AboutHero;
