"use client";

import { useEffect, useRef } from "react";

type ImageSkeletonProps = React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode };

// Frame for an <img> / next/image: shows the skeleton sweep behind the picture until it has loaded (or failed).
// Works with server-rendered children: it checks the picture once mounted, then listens for any image inside
// finishing, including one rendered or swapped in later.
const ImageSkeleton = ({ className = "", children, ...rest }: ImageSkeletonProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const done = () => {
      el.dataset.loaded = "";
    };
    // Finished before hydration — loaded, or failed: a broken image counts as complete too, and its error event
    // has already fired, so waiting for one would keep the sweep running for good
    if (el.querySelector("img")?.complete) return done();
    // load and error don't bubble, so catch them on their way down
    el.addEventListener("load", done, { capture: true, once: true });
    el.addEventListener("error", done, { capture: true, once: true });
    return () => {
      el.removeEventListener("load", done, { capture: true });
      el.removeEventListener("error", done, { capture: true });
    };
  }, []);

  return (
    <div ref={ref} className={`img-skeleton ${className}`} {...rest}>
      {children}
    </div>
  );
};

export default ImageSkeleton;
