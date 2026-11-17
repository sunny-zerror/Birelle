"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ImageSkeleton } from "@/components/ui/skeleton";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Swap in the founder's portrait when it's ready — the frame stays blank until then
const FOUNDER_PHOTO: string | null = null;
const FOUNDER_NAME = "Sohail";

const AboutFounder = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Polaroid drifts up over the title and straightens out as it arrives
      gsap.fromTo(
        ".about-founder__polaroid",
        { y: 120, rotate: -6 },
        {
          y: 0,
          rotate: 0,
          ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "center center", scrub: true },
        },
      );

      gsap.from(".about-founder__line", {
        yPercent: 100,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ".about-founder__title", start: "top 85%" },
      });

      gsap.from(".about-founder__copy > *", {
        y: 24,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".about-founder__copy", start: "top 85%" },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="about-founder" className="about-founder overflow-hidden bg-white py-section">
      <div className="container flex flex-col items-center">
        <h2 className="about-founder__title primary-font text-center text-[3.25rem] font-normal uppercase leading-[0.92] text-deep md:text-[8rem]">
          {/* Each line is masked so it can slide up into place */}
          <span className="block overflow-hidden">
            <span className="about-founder__line block">Meet the</span>
          </span>
          <span className="block overflow-hidden">
            <span className="about-founder__line block">Founder</span>
          </span>
        </h2>

        {/* Polaroid — overlaps the lower half of "Founder" */}
        <figure className="about-founder__polaroid relative z-1 -mt-[1.6rem] w-[15rem] border border-ink/70 bg-[#f5f5f5] p-3 pb-0 shadow-[0_24px_48px_-24px_rgb(0_0_0/0.25)] will-change-transform md:-mt-[4rem] md:w-[20rem] md:p-3.5 md:pb-0">
          <div className="aspect-[1/0.92] overflow-hidden border border-ink/70 bg-white">
            {FOUNDER_PHOTO && (
              <ImageSkeleton className="size-full">
                <img src={FOUNDER_PHOTO} alt={FOUNDER_NAME} className="cover" loading="lazy" />
              </ImageSkeleton>
            )}
          </div>
          <figcaption className="py-5 text-center text-ink md:py-6">
            <span className="primary-font block text-sm uppercase tracking-wide">{FOUNDER_NAME}</span>
            <span className="mt-1 block text-xs">Founder, BIRELLE</span>
          </figcaption>
        </figure>

        <div className="about-founder__copy mt-stack flex max-w-[36rem] flex-col gap-5 text-center text-sm   text-ink md:mt-20">
          <p>
            BIRELLE began with a simple belief:
            <br />
            clothing should be a form of expression, free from convention and open to interpretation.
          </p>
          <p>
            What started as an idea grew into a space where art, colour and everyday clothing come together. Every
            collection is an opportunity to explore something new, challenge the expected and create pieces that feel
            personal to the people who wear them. For us, it has always been about more than what we make. It is about
            the freedom to experiment, the courage to see things differently and the individuality that makes every
            expression unique.
          </p>
          <p>Thank you for being part of the journey.</p>
        </div>
      </div>
    </section>
  );
};

export default AboutFounder;
