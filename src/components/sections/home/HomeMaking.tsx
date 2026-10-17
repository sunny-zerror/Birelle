"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Half = [left: string, right: string];

// Every title and copy line is authored as two halves so it can part around the image
const steps: { title: Half; lines: Half[]; image: string; alt: string }[] = [
  {
    title: ["The Id", "ea"],
    lines: [
      ["Every piece begins", "with a distinct point of view"],
      ["shaped by inspiration,", "proportion and quiet intent"],
      ["and the feeling we want", "the garment to carry"],
    ],
    image: "/images/homepage/who_we_are/img1.svg",
    alt: "Hands arranging fabric swatches and colour chips beside fashion sketches",
  },
  {
    title: ["The Mate", "rial"],
    lines: [
      ["We explore texture,", "weight, colour and structure"],
      ["to find the materials", "that bring each idea to life"],
      ["every fabric chosen", "with care and intention"],
    ],
    image: "/images/homepage/who_we_are/img2.svg",
    alt: "Close-up of soft folded cream fabric",
  },
  {
    title: ["The Fo", "rm"],
    lines: [
      ["Ideas take shape", "through considered silhouettes"],
      ["refined proportions", "and deliberate details"],
      ["designed around how", "the garment moves and feels"],
    ],
    image: "/images/homepage/who_we_are/img3.svg",
    alt: "A black garment being fitted on a dress form in the studio",
  },
  {
    title: ["The Fin", "ish"],
    lines: [
      ["The final expression", "comes together in the details"],
      ["thoughtful finishes", "and a quiet precision"],
      ["behind every piece", "that carries our name"],
    ],
    image: "/images/homepage/who_we_are/img4.svg",
    alt: "Finished black BIRELLE t-shirt with an embroidered emblem",
  },
];

// Scroll distances, as multiples of the viewport height
const T = {
  hold: 0.35, // photo sits closed before it starts to split
  split: 1.2, // photo halves slide apart
  imageEntryStart: 0.5, // small image starts revealing at 50% of the split
  textDelay: 0.3, // quiet moment before the first title rises
  item: 1.1, // scroll given to each step
  swap: 0.3, // image crossfade between steps
  exit: 1.2, // halves close back together
};
const SHELL_VH = 100 + 100 * (T.hold + T.split + T.textDelay + T.item * steps.length + T.exit);

const clamp = gsap.utils.clamp(0, 1);
const smooth = (v: number) => {
  v = clamp(v);
  return v * v * (3 - 2 * v);
};

type Line = {
  el: HTMLElement;
  left: HTMLElement;
  right: HTMLElement;
  block: number;
  isTitle: boolean;
  offset: number;
  leftWidth: number;
  rightWidth: number;
  leftPad: number;
  rightPad: number;
};

const HomeMaking = () => {
  const sectionRef = useRef<HTMLElement>(null);

  // A pinned sequence driven straight off the scroll position:
  // photo splits open → small image wipes in → each step's copy rises and parts around
  // the image → images crossfade → everything closes again in reverse
  useGSAP(
    () => {
      const section = sectionRef.current!;
      const q = gsap.utils.selector(section);
      const stage = q(".home-making__stage")[0] as HTMLElement;
      const halves = q(".home-making__half") as HTMLElement[];
      const halfImages = q(".home-making__half img") as HTMLElement[];
      const label = q(".home-making__label")[0] as HTMLElement;
      const media = q(".home-making__media")[0] as HTMLElement;
      const images = q(".home-making__image") as HTMLElement[];
      const titles = q(".home-making__title") as HTMLElement[];
      const copies = q(".home-making__copy") as HTMLElement[];
      const mobile = window.matchMedia("(max-width: 767px)");

      // Geometry, refreshed on every ScrollTrigger refresh (load, resize, fonts)
      let shellTop = 0;
      let shellHeight = 0;
      let vw = 0;
      let vh = 0;
      let maxTravel = 0;
      let parallax = 0;
      let titleGap = 0;
      let clearance = 0;
      let avoid = 0;
      let obstacleTop = 0;
      let obstacleBottom = 0;
      let imageLeft = 0;
      let imageRight = 0;
      let lines: Line[] = [];

      const measure = () => {
        const isMobile = mobile.matches;
        vw = stage.clientWidth;
        vh = stage.clientHeight;
        shellTop = section.getBoundingClientRect().top + window.scrollY;
        shellHeight = section.offsetHeight;

        // How much photo stays visible at each edge once it has split open
        const edge = isMobile ? 16 : vw * 0.2;
        maxTravel = Math.max(0, vw / 2 - edge);
        parallax = isMobile ? 30 : 45;
        titleGap = isMobile ? 28 : 50;
        clearance = isMobile ? 12 : 35;
        avoid = isMobile ? 90 : 100;

        // Label + image form one centred obstacle the copy has to part around
        const imageW = media.offsetWidth;
        const imageH = media.offsetHeight;
        imageLeft = vw / 2 - imageW / 2 - clearance;
        imageRight = vw / 2 + imageW / 2 + clearance;
        obstacleBottom = vh / 2 + imageH / 2;
        obstacleTop = label.offsetTop;

        lines = (q("[data-split-line]") as HTMLElement[])
          .map((el) => {
            const left = el.querySelector<HTMLElement>("[data-half=left]")!;
            const right = el.querySelector<HTMLElement>("[data-half=right]")!;
            const isTitle = el.classList.contains("home-making__title");
            return {
              el,
              left,
              right,
              block: Number(el.closest<HTMLElement>("[data-block]")!.dataset.block),
              isTitle,
              offset: isTitle ? 0 : el.offsetTop + el.offsetHeight / 2,
              leftWidth: left.offsetWidth,
              rightWidth: right.offsetWidth,
              leftPad: parseFloat(getComputedStyle(left).paddingRight) || 0,
              rightPad: parseFloat(getComputedStyle(right).paddingLeft) || 0,
            };
          });
      };

      const setClip = (reveal: number) => {
        const clip = `inset(0% 0% ${((1 - reveal) * 100).toFixed(3)}% 0%)`;
        media.style.clipPath = clip;
        label.style.clipPath = clip;
      };

      const render = () => {
        const p = window.scrollY - shellTop;

        const splitStart = T.hold * vh;
        const splitEnd = splitStart + T.split * vh;
        const textStart = splitEnd + T.textDelay * vh;
        const textEnd = textStart + T.item * vh * steps.length;
        const exitLinear = clamp((p - textEnd) / (T.exit * vh));
        const exitProgress = smooth(exitLinear);

        // 1. Photo halves slide apart, then back together at the end
        const travel = maxTravel * smooth((p - splitStart) / (T.split * vh)) * (1 - exitProgress);
        halves[0].style.transform = `translate3d(${-travel}px,0,0)`;
        halves[1].style.transform = `translate3d(${travel}px,0,0)`;

        // Inner parallax — settles as the section arrives, drifts up once it has closed and leaves
        const entry = parallax * (1 - smooth((p + vh) / vh));
        const leave = -parallax * smooth((p - (shellHeight - vh)) / vh);
        const imageY = exitProgress < 1 ? entry : leave;
        halfImages.forEach((img) => (img.style.transform = `translate3d(0,${imageY}px,0)`));

        // 2. Small image + label wipe in top → bottom, finishing exactly as the split does
        const smallStart = splitStart + T.split * vh * T.imageEntryStart;
        if (p >= textEnd) {
          setClip(smooth((1 - exitLinear - T.imageEntryStart) / (1 - T.imageEntryStart)));
        } else {
          setClip(smooth((p - smallStart) / (splitEnd - smallStart)));
        }

        // 3. Crossfade the step images around each step boundary
        const textScroll = p - textStart;
        const swap = steps.map((_, i) =>
          i === 0 ? 0 : smooth((textScroll - (i * T.item * vh - (T.swap * vh) / 2)) / (T.swap * vh)),
        );
        images.forEach((img, i) => {
          const enter = i === 0 ? 1 : swap[i];
          const exit = i === images.length - 1 ? 0 : swap[i + 1];
          img.style.opacity = (enter * (1 - exit)).toFixed(3);
        });

        // 4. Titles + copy rise from below the fold, one step after another
        const titleYs = steps.map((_, i) => vh + 80 - (textScroll - i * T.item * vh));
        titleYs.forEach((y, i) => {
          titles[i].style.transform = `translate3d(0,${y.toFixed(2)}px,0)`;
          copies[i].style.transform = `translate3d(0,${(y + titleGap).toFixed(2)}px,0)`;
        });

        // 5. Each line parts around the image while it passes, then closes up again
        lines.forEach((line) => {
          const top = line.isTitle ? titleYs[line.block] : titleYs[line.block] + titleGap;
          const cy = top + line.offset;

          let influence = 0;
          if (cy >= obstacleTop && cy <= obstacleBottom) influence = 1;
          else if (cy > obstacleBottom) influence = smooth(1 - (cy - obstacleBottom) / avoid);
          else influence = smooth(1 - (obstacleTop - cy) / avoid);

          // Lines are centred, so their resting edges follow from the measured half widths
          const lineLeft = vw / 2 - (line.leftWidth + line.rightWidth) / 2;
          const leftEdge = lineLeft + line.leftWidth - line.leftPad;
          const rightEdge = lineLeft + line.leftWidth + line.rightPad;
          const leftShift = Math.max(0, leftEdge - imageLeft) * influence;
          const rightShift = Math.max(0, imageRight - rightEdge) * influence;

          line.left.style.transform = `translate3d(${(-leftShift).toFixed(2)}px,0,0)`;
          line.right.style.transform = `translate3d(${rightShift.toFixed(2)}px,0,0)`;
        });
      };

      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onRefresh: () => {
          measure();
          render();
        },
        onUpdate: render,
      });

      measure();
      render();

      // Half widths depend on the web fonts — re-measure once they are in
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="home-making"
      aria-labelledby="home-making-title"
      className="home-making relative bg-white"
      style={{ height: `${SHELL_VH}vh` }}
    >
      <h2 id="home-making-title" className="sr-only">
        The Making of Birelle
      </h2>

      {/* Sticky stage — pinned for the whole sequence */}
      <div className="home-making__stage sticky top-0 h-screen overflow-hidden bg-white">
        {/* Full photo, cut into two halves that slide apart */}
        <div className="home-making__frame absolute inset-0 z-20 overflow-hidden">
          {(["left", "right"] as const).map((side) => (
            <div
              key={side}
              className={`home-making__half absolute top-0 h-full w-1/2 overflow-hidden will-change-transform ${
                side === "left" ? "left-0" : "right-0"
              }`}
            >
              <img
                src="/images/homepage/who_we_are/main_img.svg"
                alt=""
                aria-hidden="true"
                loading="lazy"
                className={`absolute -top-11.25 h-[calc(100%+90px)] w-[200%] max-w-none object-cover will-change-transform max-md:-top-7.5 max-md:h-[calc(100%+60px)] ${
                  side === "left" ? "left-0" : "right-0"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Steps flow over the opened gap */}
        <div className="home-making__flow pointer-events-none absolute inset-0 z-30 overflow-hidden text-ink">
          {/* Label sits fixed above the image */}
          <p
            aria-hidden="true"
            className="home-making__label primary-font absolute bottom-1/2 left-1/2 mb-[calc(var(--mk-img-h)/2+0.9rem)] -translate-x-1/2 whitespace-nowrap text-[0.8125rem] uppercase leading-none tracking-[0.08em] text-deep [--mk-img-h:15.5rem] max-md:text-[0.625rem] max-md:[--mk-img-h:10rem]"
            style={{ clipPath: "inset(0% 0% 100% 0%)" }}
          >
            The Making of Birelle
          </p>

          {/* One fixed frame, the step images crossfade inside it */}
          <div
            className="home-making__media absolute left-1/2 top-1/2 z-5 h-62 w-48 -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-neutral-100 max-md:h-40 max-md:w-31"
            style={{ clipPath: "inset(0% 0% 100% 0%)" }}
          >
            {steps.map((step, i) => (
              <img
                key={step.image}
                src={step.image}
                alt={step.alt}
                loading="lazy"
                className="home-making__image cover absolute inset-0"
                style={{ zIndex: i + 1, opacity: i === 0 ? 1 : 0 }}
              />
            ))}
          </div>

          {steps.map((step, i) => (
            <div key={step.image} data-block={i} className="home-making__block absolute inset-0">
              <h3
                data-split-line
                className="home-making__title secondary-font absolute left-1/2 top-0 z-2 flex w-max -translate-x-1/2 -translate-y-1/2 items-baseline whitespace-nowrap text-sm font-medium uppercase text-ink "
                style={{ transform: "translate3d(0,200vh,0)" }}
              >
                <span data-half="left" className="inline-block will-change-transform">
                  {step.title[0]}
                </span>
                <span data-half="right" className="inline-block will-change-transform">
                  {step.title[1]}
                </span>
              </h3>

              {/* On phones each half wraps inside the column beside the image (--mk-side = half the screen
                  minus half the 7.75rem image, the 12px clearance and a 12px gutter) so it can part like desktop */}
              <div
                className="home-making__copy absolute left-1/2 top-0 z-7 w-max -translate-x-1/2 text-sm text-ink max-md:text-xs max-md:[--mk-side:calc(50vw-5.375rem)]"
                style={{ transform: "translate3d(0,200vh,0)" }}
              >
                {step.lines.map(([left, right]) => (
                  <p
                    key={left}
                    data-split-line
                    className="home-making__line relative mx-auto flex w-max items-baseline justify-center whitespace-nowrap max-md:mb-2 max-md:items-start max-md:whitespace-normal"
                  >
                    <span
                      data-half="left"
                      className="inline-block pr-[0.25em] text-right will-change-transform max-md:max-w-(--mk-side)"
                    >
                      {left}
                    </span>
                    <span
                      data-half="right"
                      className="inline-block pl-[0.25em] text-left will-change-transform max-md:max-w-(--mk-side)"
                    >
                      {right}
                    </span>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeMaking;
