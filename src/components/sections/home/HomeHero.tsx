"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { RiArrowDownSLine, RiPauseFill, RiPlayFill } from "@remixicon/react";
import { useLoader } from "@/components/providers/LoaderProvider";

gsap.registerPlugin(ScrollTrigger, useGSAP);

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
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const { isLoaded, entry } = useLoader();
  // Under the loader the film only buffers; coming back to the page later it autoplays muted as usual
  const [hadEnteredAtMount] = useState(entry !== null);

  // The film may already show a frame (or have failed) before hydration, when React wasn't yet listening
  const attachVideo = (video: HTMLVideoElement | null) => {
    videoRef.current = video;
    if (video && (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA || video.error)) setIsVideoReady(true);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  // Entering from the loader starts the film from its first frame, with sound if that was the choice;
  // if the browser refuses the sound, it plays muted
  useEffect(() => {
    const video = videoRef.current;
    if (!video || entry === null || hadEnteredAtMount) return;
    video.currentTime = 0;
    video.muted = entry !== "sound";
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => {});
    });
  }, [entry, hadEnteredAtMount]);

  // Intro — the video is full screen from the start; only the text over it comes in, held hidden under the loader
  useGSAP(
    () => {
      const wordmark = wordmarkRef.current;
      const film = gsap.utils.toArray<HTMLElement>(".home-hero__film-item");
      const cue = ".home-hero__scroll";

      if (!isLoaded) {
        gsap.set([wordmark, ...film, cue], { autoAlpha: 0 });
        return;
      }

      // fromTo, not to: on a client-side route change (loader already done) or after the !isLoaded set is
      // reverted, everything is already at full opacity, so a plain .to(1) would have nothing to animate
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .fromTo(
          wordmark,
          { autoAlpha: 0, y: 40, filter: "blur(8px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.6, clearProps: "transform,filter" },
          0.5,
        )
        .fromTo(film, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.12 }, 0.5)
        // Opacity only: the cue's own nudge animation owns its transform
        .fromTo(cue, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: "power2.out" }, 0.9);
    },
    { scope: sectionRef, dependencies: [isLoaded] },
  );

  // Sound switches itself off once the hero scrolls out of view; it stays off until turned back on
  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        onLeave: () => {
          const video = videoRef.current;
          if (!video || video.muted) return;
          video.muted = true;
          setMuted(true);
        },
      });
    },
    { scope: sectionRef },
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
      {/* Video layer — full screen from the start; a dark skeleton sweeps until the film can play, then it fades in */}
      <div
        className="home-hero__media img-skeleton img-skeleton--dark absolute inset-0 overflow-hidden bg-ink"
        data-loaded={isVideoReady || undefined}
      >
        <video
          ref={attachVideo}
          loop autoPlay={hadEnteredAtMount} preload="auto" muted playsInline
          className={`cover ${isVideoReady ? "opacity-100" : "opacity-0"}`}
          src="/videos/home_hero_video.mp4"
          // The skeleton ends on the first frame, or if the film can't load at all (rather than sweeping for good)
          onLoadedData={() => setIsVideoReady(true)}
          onCanPlay={() => setIsVideoReady(true)}
          onError={() => setIsVideoReady(true)}
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
        />
        {/* Film caption + playback controls */}
        <div className="home-hero__film secondary-font absolute inset-x-0 bottom-16 z-1 md:bottom-6">
          <div className="container flex items-center justify-between gap-6 text-xs uppercase text-white">
            <p className="home-hero__film-item font-medium tracking-[0.2em]">Autumn Winter 2026 — The Film</p>
            <div className="home-hero__film-item flex items-center gap-6 tracking-wide">
              <button type="button" onClick={togglePlay} className="flex items-center gap-1.5 uppercase">
                {paused ? <RiPlayFill size={14} /> : <RiPauseFill size={14} />}
                {paused ? "Play" : "Pause"}
              </button>
              <button type="button" onClick={toggleSound} aria-pressed={!muted} className="uppercase">
                {muted ? "Sound Off" : "Sound On"}
              </button>
            </div>
          </div>
        </div>
        {/* Scroll cue */}
        <div
          aria-hidden="true"
          className="home-hero__scroll center absolute inset-x-0 bottom-6 mx-auto size-8 animate-nudge text-white"
        >
          <RiArrowDownSLine size={20} />
        </div>
      </div>

      {/* Wordmark — fixed above the header so it can dock into the logo slot; the header hides its own logo on this page */}
      <div ref={wordmarkRef} aria-hidden="true" className="home-hero__wordmark pointer-events-none fixed inset-x-0 top-0 z-51" style={{ opacity: 0, visibility: "hidden" }}>
        <div className="container pt-header">
          <img src="/logo.svg" alt="" width={1307} height={127} className="block h-auto w-full" />
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
