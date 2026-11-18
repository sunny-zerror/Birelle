"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Button from "@/components/ui/Button";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const IMG = "/images/homepage/lookbook";
const FACES = 4;
const SPIN_MS = 500; // time per face while hovering

const people = [
  { key: "person1", alt: "Look one — black raglan tee with painted sleeves and printed jogger" },
  { key: "person2", alt: "Look two — painted vest and white trouser with printed side panel" },
] as const;

// One figure: all four turnaround shots stacked, only the current one shown (instant swap, like a turntable).
// Every shot is sized by height (all sources are 887px tall) and centred on the same axis, so the
// person stays the same size and position whichever way they face — widths differ per view.
const Figure = ({
  person,
  face,
  onEnter,
  onLeave,
}: {
  person: (typeof people)[number];
  face: number;
  onEnter: () => void;
  onLeave: () => void;
}) => (
  <div
    onPointerEnter={onEnter}
    onPointerLeave={onLeave}
    className="home-lookbook__figure relative h-full w-[42%] md:w-[24%]"
  >
    {Array.from({ length: FACES }, (_, i) => (
      <img
        key={i}
        src={`${IMG}/${person.key}/img${i + 1}.png`}
        alt={i === 0 ? person.alt : ""}
        aria-hidden={i === 0 ? undefined : true}
        draggable={false}
        loading="lazy"
        className={`absolute bottom-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2 ${i === face ? "visible" : "invisible"}`}
      />
    ))}
  </div>
);

const HomeLookbook = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [spinFace, setSpinFace] = useState(0);

  // Entrance — each figure travels in from its own screen edge (left one from the left, right from the right)
  // and fades up as the section comes into view. Runs on the wrapper, so it never clashes with the per-face x.
  useGSAP(
    () => {
      gsap.from(".home-lookbook__figure", {
        x: (i: number, el: HTMLElement) => {
          const r = el.getBoundingClientRect();
          return i === 0 ? -r.right : window.innerWidth - r.left;
        },
        autoAlpha: 0,
        duration: 1.6,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%", toggleActions: "play none none reverse" },
      });
    },
    { scope: sectionRef },
  );

  // Both figures face front; hovering one spins it continuously, starting from the next view
  useEffect(() => {
    if (hovered === null) return;
    const id = window.setInterval(() => setSpinFace((f) => (f + 1) % FACES), SPIN_MS);
    return () => clearInterval(id);
  }, [hovered]);

  const enter = (i: number) => {
    setSpinFace(1);
    setHovered(i);
  };
  const leave = () => setHovered(null);

  return (
    // One screen tall, less the fixed header; on mobile the copy below shares that height with the plate
    <section
      ref={sectionRef}
      id="home-lookbook"
      className="home-lookbook relative flex h-[calc(100svh-var(--spacing-header-bar))] flex-col bg-white"
    >
      {/* Editorial plate — two looks framing the centre column */}
      <div className="home-lookbook__media container relative flex min-h-0 w-full flex-1 items-end justify-between overflow-hidden pt-[4vw] md:px-[8vw]">
        {people.map((person, i) => (
          <Figure
            key={person.key}
            person={person}
            face={hovered === i ? spinFace : 0}
            onEnter={() => enter(i)}
            onLeave={leave}
          />
        ))}

        {/* Centre copy sits in the gap between the figures from md up */}
        <div className="home-lookbook__copy pointer-events-none absolute inset-0 hidden md:block">
          <div className="pointer-events-auto absolute inset-x-0 top-[31%] mx-auto flex max-w-[18rem] flex-col items-center text-center">
            <h2 className="primary-font font-normal text-h-lookbook uppercase text-deep">Limitless</h2>
            <p className="mt-4 text-sm  text-ink">
              {"BIRELLE explores timeless form, quiet confidence, and freedom without boundaries."}
            </p>
          <div className=" mt-10">
            <Button href="/lookbook" className="home-lookbook__cta">View Lookbook</Button>
          </div>
          </div>
        </div>
      </div>

      {/* Mobile copy stacks under the plate */}
      <div className="home-lookbook__copy-mobile container flex flex-col items-center pb-10 pt-6 text-center md:hidden">
        <h2 className="primary-font font-normal text-h-lookbook text-deep">Limitless</h2>
        <p className="mt-3 max-w-[16rem] text-caption text-ink">
          {"BIRELLE explores timeless form, quiet confidence, and freedom without boundaries."}
        </p>
        <Button href="/lookbook" className="home-lookbook__cta mt-6">View Lookbook</Button>
      </div>
    </section>
  );
};

export default HomeLookbook;
