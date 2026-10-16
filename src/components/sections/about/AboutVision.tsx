"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const IMG = "/images/aboutpage/webp";

const moodboard = [
  { src: `${IMG}/collection-1.webp`, alt: "A hand-painted garment being stitched on a sewing machine" },
  { src: `${IMG}/collection-2.webp`, alt: "Model in a painted white tee against a blue sky" },
  { src: `${IMG}/collection-3.webp`, alt: "Behind the scenes of a BIRELLE photoshoot on location" },
  { src: `${IMG}/collection-4.webp`, alt: "Brushes and paint over a sketch of a classical portrait" },
  { src: `${IMG}/collection-5.webp`, alt: "Collage of Mediterranean architecture and pressed blue flowers" },
  { src: `${IMG}/collection-6.webp`, alt: "Illustrated classical bust with blue and ochre brushstrokes" },
  { src: `${IMG}/collection-7.webp`, alt: "Model at a window overlooking an old city at golden hour" },
  { src: `${IMG}/collection-8.webp`, alt: "Hands arranging fabric color swatches, fashion sketches, and tailor scissors on a studio worktable" },
];

const AboutVision = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Tiles unmask upward in reading order as the grid enters
      gsap.fromTo(
        ".about-vision__tile",
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.2,
          ease: "power3.inOut",
          stagger: 0.08,
          scrollTrigger: { trigger: ".about-vision__grid", start: "top 80%" },
        },
      );
      gsap.from(".about-vision__tile img", {
        scale: 1.25,
        duration: 1.6,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ".about-vision__grid", start: "top 80%" },
      });

      gsap.from(".about-vision__copy > *", {
        y: 24,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".about-vision__copy", start: "top 90%" },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="about-vision" className="about-vision bg-white py-section">
      <div className="container">
        <ul className="about-vision__grid mx-auto grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-2.5">
          {moodboard.map((image) => (
            <li key={image.src} className="about-vision__tile group aspect-square overflow-hidden bg-neutral-100">
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
              />
            </li>
          ))}
        </ul>

        <div className="about-vision__copy mx-auto mt-stack max-w-[36rem] text-center text-ink md:mt-16">
          <h2 className="secondary-font text-sm font-semibold">Sohail — The Creative Vision Behind BIRELLE</h2>
          <p className="mt-5 text-sm  ">
            BIRELLE is my exploration of art, colour and self-expression through clothing. Every piece begins with an
            idea and evolves through experimentation, creating something unexpected yet personal. For me, the journey
            is just as important as the final piece.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutVision;
