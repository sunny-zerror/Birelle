"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { RiArrowDownSLine } from "@remixicon/react";
import { useLoader } from "@/components/providers/LoaderProvider";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Card is the centre 60% of the screen; the inset shrinks to 0 so it opens evenly from every edge
const INSET_START = 20; // %
const inset = (v: number) => `inset(${v}% ${v}% ${v}% ${v}%)`;

// Layout position of an element, ignoring any transforms on it (offset* skip transforms)
const layoutRect = (el: HTMLElement) => {
  let x = 0;
  let y = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) {
    x += n.offsetLeft;
    y += n.offsetTop;
  }
  return { x, y, width: el.offsetWidth };
};

const HomeHero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const { isLoaded } = useLoader();

  // Intro — held hidden under the loader. Card (outer) does the 3D lid swing, media (inner) does the clip,
  // so the transform and the clip never fight over one element.
  useGSAP(
    () => {
      const card = cardRef.current;
      const media = mediaRef.current;
      const video = media?.querySelector("video");
      if (!card || !media) return;
      const clip = { value: INSET_START };

      const wordmark = wordmarkRef.current;

      if (!isLoaded) {
        gsap.set(card, { autoAlpha: 0 });
        gsap.set(wordmark, { autoAlpha: 0 });
        return;
      }

      gsap
        .timeline()
        .set(card, { autoAlpha: 1, transformOrigin: "50% 80%" })
        .fromTo(
          card,
          { rotateX: -88, rotateZ: -4, scale: 0.6, z: -400 },
          { rotateX: 0, rotateZ: 0, scale: 1, z: 0, duration: 1.8, ease: "expo.out" },
        )
        .set(media, { clipPath: inset(INSET_START) }, 0)
        .fromTo(video ?? [], { scale: 1.4, yPercent: 6 }, { scale: 1.15, yPercent: 0, duration: 1.8, ease: "expo.out" }, 0)
        .set(card, { clearProps: "transform" })
        .to(
          clip,
          {
            value: 0,
            duration: 1.6,
            ease: "power3.inOut",
            onUpdate: () => {
              media.style.clipPath = inset(clip.value);
            },
          },
          "-=0.2",
        )
        .to(video ?? [], { scale: 1, duration: 1.6, ease: "power3.inOut" }, "<")
        // Wordmark fades in once the clip has opened past it
        .to(wordmark, { autoAlpha: 1, duration: 0.8, ease: "power2.out" }, "-=0.5");
    },
    { scope: sectionRef, dependencies: [isLoaded] },
  );

  // Wordmark docks into the header logo slot as soon as scrolling starts, and undocks back at the top.
  // It stays fixed, so the page scrolling under it never throws the landing spot off.
  useGSAP(
    () => {
      const logo = wordmarkRef.current?.querySelector("img");
      const target = document.querySelector<HTMLElement>(".site-header__logo img");
      if (!logo || !target) return;

      gsap.fromTo(
        logo,
        { x: 0, y: 0, scale: 1 },
        {
          x: () => layoutRect(target).x - layoutRect(logo).x,
          y: () => layoutRect(target).y - layoutRect(logo).y,
          scale: () => layoutRect(target).width / layoutRect(logo).width,
          transformOrigin: "0 0",
          duration: 0.5,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 1,
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true,
          },
        },
      );

      // Turns dark with the header once it goes white (same 30% threshold as the header)
      gsap.fromTo(logo, { filter: "invert(0)" }, {
        filter: "invert(1)",
        duration: 0.3,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top -30%", toggleActions: "play none none reverse" },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="home-hero" data-hero className="home-hero relative h-screen bg-white">
      {/* Perspective on the stage so the vanishing point sits at screen centre */}
      <div className="home-hero__stage relative h-full overflow-hidden perspective-[1400px]">
        <div ref={cardRef} className="home-hero__card absolute inset-0 transform-3d">
        {/* Video layer — full screen, revealed by the clip-path */}
        <div
          ref={mediaRef}
          className="home-hero__media absolute inset-0 overflow-hidden bg-ink"
          style={{ clipPath: inset(INSET_START) }}
        >
          <video
            loop autoPlay muted playsInline
            className="cover object-[30%_20%]"
            src="/videos/home_hero_video.mp4"
          />
          {/* Scroll cue */}
          <div
            aria-hidden="true"
            className="home-hero__scroll center absolute inset-x-0 bottom-6 mx-auto size-8 animate-nudge text-white"
          >
            <RiArrowDownSLine size={20} />
          </div>
        </div>
        </div>
      </div>

      {/* Wordmark — fixed above the header so it can dock into the logo slot; the header hides its own logo on this page */}
      <div ref={wordmarkRef} aria-hidden="true" className="home-hero__wordmark pointer-events-none fixed inset-x-0 top-0 z-51">
        <div className="container pt-header">
          <img src="/logo.svg" alt="" width={1307} height={127} className="block h-auto w-full" />
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
