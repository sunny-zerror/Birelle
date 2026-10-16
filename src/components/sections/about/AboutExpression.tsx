"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const AboutExpression = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".about-expression__line", {
        yPercent: 100,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ".about-expression__title", start: "top 85%" },
      });

      // Photo drifts inside its frame while the section scrolls
      gsap.fromTo(
        ".about-expression__media img",
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: { trigger: ".about-expression__media", start: "top bottom", end: "bottom top", scrub: true },
        },
      );

      gsap.from(".about-expression__copy", {
        y: 24,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".about-expression__copy", start: "top 90%" },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="about-expression" className="about-expression bg-white py-section">
      <div className="container flex flex-col items-center">
        <h2 className="about-expression__title primary-font text-center text-[2.25rem] font-normal uppercase leading-[1.05] text-deep md:text-[3.5rem]">
          <span className="block overflow-hidden">
            <span className="about-expression__line block">Make room</span>
          </span>
          <span className="block overflow-hidden">
            <span className="about-expression__line block">for expression.</span>
          </span>
        </h2>

        <div className="about-expression__media relative mt-stack aspect-551/637 w-full max-w-[34rem] overflow-hidden bg-neutral-200 md:mt-16">
          {/* Taller than the frame so the drift never shows an edge */}
          <img
            src="/images/aboutpage/webp/store.webp"
            alt="The BIRELLE store — a stone counter beneath the logo, with painted pieces on the rails"
            loading="lazy"
            className="absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover will-change-transform"
          />
        </div>

        <p className="about-expression__copy mt-stack max-w-[30rem] text-center text-sm   text-ink md:mt-16">
          We believe clothing should leave room for individuality. For colour that surprises, ideas that evolve and the
          freedom to make every piece your own.
        </p>
      </div>
    </section>
  );
};

export default AboutExpression;
