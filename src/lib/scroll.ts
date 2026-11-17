import type { MouseEvent } from "react";

// In-page "#section" links: glide there with Lenis instead of a page transition, honouring the section's
// scroll-margin (it clears the fixed header), and keep the hash in the URL without a navigation.
export const scrollToSection = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  history.replaceState(history.state, "", `#${id}`);
  const offset = -parseFloat(getComputedStyle(el).scrollMarginTop || "0");
  if (window.lenis) window.lenis.scrollTo(el, { offset });
  else el.scrollIntoView({ behavior: "smooth" });
};
