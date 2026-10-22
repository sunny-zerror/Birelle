"use client";

import { useEffect, useRef } from "react";

type ImageSkeletonProps = React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode };

// Frame for an <img> / next/image: shows the skeleton sweep behind the picture
// until it has loaded. Works with server-rendered children (listens in the DOM).
const ImageSkeleton = ({ className = "", children, ...rest }: ImageSkeletonProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const img = el?.querySelector("img");
    if (!el || !img) return;
    const done = () => {
      el.dataset.loaded = "";
    };
    // Cached images may have finished before hydration
    if (img.complete && img.naturalWidth) return done();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
    return () => {
      img.removeEventListener("load", done);
      img.removeEventListener("error", done);
    };
  }, []);

  return (
    <div ref={ref} className={`img-skeleton ${className}`} {...rest}>
      {children}
    </div>
  );
};

export default ImageSkeleton;
