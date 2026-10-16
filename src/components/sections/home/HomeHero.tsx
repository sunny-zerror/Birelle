"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { RiArrowDownSLine } from "@remixicon/react";
import { siteConfig } from "@/config/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// How far the image is clipped in from every edge before scrolling
const CLIP_START = "inset(20% 20% 20% 20%)";
const CLIP_END = "inset(0% 0% 0% 0%)";

// Same box for both wordmarks so they line up exactly.
// Positioning lives on the outer wrapper: .container forces position: relative.
const Wordmark = ({ children, hidden = false }: { children: React.ReactNode; hidden?: boolean }) => (
  <div aria-hidden={hidden || undefined} className="home-hero__wordmark absolute inset-x-0 top-0">
    <div className="container pt-header">{children}</div>
  </div>
);

const HomeHero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  // Image frame unclips to full screen while the sticky stage is pinned
  useGSAP(
    () => {
      gsap.fromTo(
        mediaRef.current,
        { clipPath: CLIP_START },
        {
          clipPath: CLIP_END,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="home-hero" data-hero className="home-hero relative h-[150vh] bg-white">
      {/* Sticky stage — stays pinned for the extra 50vh of scroll */}
      <div className="home-hero__stage sticky top-0 h-screen overflow-hidden">
        {/* 1. Deep-colour wordmark on white, behind the image */}
        <Wordmark>
          <h1 className="home-hero__title">
            <img src="/logo-deep.svg" alt={siteConfig.name} width={1307} height={127} className="block h-auto w-full" />
          </h1>
        </Wordmark>

        {/* 2. Image layer with the white wordmark — full screen, revealed by the clip-path */}
        <div
          ref={mediaRef}
          className="home-hero__media absolute inset-0 bg-ink"
          style={{ clipPath: CLIP_START }}
        >
          <img
            className="cover object-[30%_20%]"
            src="/images/homepage/hero/hero.svg"
            alt="Model in a cream knit sweater looking up in a sunlit garden"
            fetchPriority="high"
          />
          {/* Front wordmark — white, clipped with the image so it only shows over the photo */}
          <Wordmark hidden>
            <img src="/logo.svg" alt="" width={1307} height={127} className="block h-auto w-full" />
          </Wordmark>

          {/* Scroll cue */}
          <div
            aria-hidden="true"
            className="home-hero__scroll center absolute inset-x-0 bottom-6 mx-auto size-8 animate-nudge text-white"
          >
            <RiArrowDownSLine size={20} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
