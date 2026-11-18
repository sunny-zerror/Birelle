"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Button from "@/components/ui/Button";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// One mask per word: overflow-hidden wrapper, the word inside rises from yPercent 100.
// The small padding / negative margin pair keeps cap tops from being clipped by the tight leading.
const Word = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block overflow-hidden pt-[0.08em] -mt-[0.08em] align-top">
    <span className="home-collection__word inline-block">{children}</span>
  </span>
);

const HomeCollection = () => {
  const sectionRef = useRef<HTMLElement>(null);

  // Words rise into their masks as the section comes into view, and drop back out when scrolled back above it
  useGSAP(
    () => {
      gsap.fromTo(
        ".home-collection__word",
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: ".home-collection__title",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="home-collection" className="home-collection relative flex h-dvh flex-col overflow-hidden bg-white pb-section pt-[4vw]">
      {/* Headline sits behind the figure, which overlaps lines two and three. Figure fills the height left over so the section stays one screen tall */}
      <div className="home-collection__stage relative flex min-h-0 flex-1 justify-center">
        <h2 className="home-collection__title primary-font absolute inset-x-0 top-0 z-0 text-center text-[11.5vw] font-normal uppercase leading-[0.89] text-deep">
          <Word>Beyond</Word>
          <br />
          <Word>The</Word> <Word>Ordinary</Word>
          <br />
          <Word>20</Word>
          <span className="opacity-0">.....</span>
          <Word>26</Word>
        </h2>

        <img
          src="/images/homepage/beyond_ordinary_section/standing_person.svg"
          alt="Model wearing a hand-painted tank and printed wide-leg trouser"
          width={371}
          height={631}
          loading="lazy"
          className="home-collection__figure relative z-10 block h-full w-auto max-w-[80vw] object-contain object-bottom pt-[8.5vw] md:max-w-[26vw]"
        />
      </div>

      <div className="home-collection__foot container mt-6 flex flex-col items-center gap-6 md:mt-0 md:flex-row md:items-end md:justify-between">
        <p className="md:max-w-sm text-sm max-sm:text-center leading-tight text-ink">
          A collection shaped by uninhibited movement and contemporary expression, where expressive prints, and
          considered details come together without boundaries.
        </p>
        <Button href="/shop">
          Discover the Collection
        </Button>
      </div>
    </section>
  );
};

export default HomeCollection;
