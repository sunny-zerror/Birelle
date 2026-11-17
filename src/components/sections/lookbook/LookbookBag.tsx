"use client";

import { useId } from "react";
import { LOOKBOOK_SEASON } from "@/data/lookbook";

// Bag artwork geometry in viewBox units — LookbookHero maps it to screen px for the cloth physics
export const BAG = {
  width: 264,
  height: 314,
  // front face
  left: 2,
  right: 262,
  top: 112,
  bottom: 312,
  // top of the handles
  handleTop: 13,
} as const;

const { left: L, right: R, top: T, bottom: B } = BAG;
const MID = (L + R) / 2;
// Facing the screen, seen from just above: the back panel's top edge sits a little higher and
// narrower than the front's, and the side gussets fold in at the top corners
const BACK = 18;
const INSET = 9;
const FOLD = 22;
const HOLE_X = 46; // eyelets either side of the centre
const HOLE_Y = T + 20;

const pts = (...p: number[][]) => p.map(([x, y]) => `${x},${y}`).join(" ");

// Rope loop from one eyelet to the other; the back one hangs on the back panel — higher and narrower
const rope = (back = false) => {
  const lift = back ? BACK : 0;
  const half = back ? HOLE_X - 3 : HOLE_X;
  const y = HOLE_Y - lift;
  const c = T - 111 - lift; // control points: the loop peaks ~78 above its panel's top edge
  return `M${MID - half} ${y} C${MID - half} ${c} ${MID + half} ${c} ${MID + half} ${y}`;
};

// The mouth overlaps the face by a unit so no hairline seam shows along the front edge
const OPENING = pts(
  [L, T + 1],
  [L + FOLD, T - BACK / 2],
  [L + INSET, T - BACK],
  [R - INSET, T - BACK],
  [R - FOLD, T - BACK / 2],
  [R, T + 1],
);
const WEDGE_L = pts([L, T], [L + INSET, T - BACK], [L + FOLD, T - BACK / 2]);
const WEDGE_R = pts([R, T], [R - INSET, T - BACK], [R - FOLD, T - BACK / 2]);

type LookbookBagProps = {
  /** full: the whole bag · front: only what sits in front of its contents (drawn over the cloth) */
  variant?: "full" | "front";
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
};

// Birelle shopping bag facing the screen — deep slate paper, white wordmark, gold rope handles
const LookbookBag = ({ variant = "full", className = "", ref }: LookbookBagProps) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (name: string) => `${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  const full = variant === "full";

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`lookbook-bag lookbook-bag--${variant} ${className}`}
      style={{ aspectRatio: `${BAG.width} / ${BAG.height}` }}
    >
      <svg viewBox={`0 0 ${BAG.width} ${BAG.height}`} overflow="visible" className="block h-full w-full">
        <defs>
          <linearGradient id={id("face")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#40606c" />
            <stop offset="0.55" stopColor="#34505b" />
            <stop offset="1" stopColor="#2a404a" />
          </linearGradient>
          {/* Light from the left, and both side edges turning away into the gussets */}
          <linearGradient id={id("sheen")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity="0.14" />
            <stop offset="0.012" stopColor="#fff" stopOpacity="0.09" />
            <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.8" stopColor="#000" stopOpacity="0" />
            <stop offset="0.988" stopColor="#000" stopOpacity="0.1" />
            <stop offset="1" stopColor="#000" stopOpacity="0.22" />
          </linearGradient>
          <linearGradient id={id("base")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.8" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id={id("inside")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#21343c" />
            <stop offset="1" stopColor="#0b1418" />
          </linearGradient>
          <radialGradient id={id("glow")} cx="0.5" cy="0.75" r="0.6">
            <stop offset="0" stopColor="#f2d6a2" stopOpacity="0.95" />
            <stop offset="0.55" stopColor="#c49d68" stopOpacity="0.45" />
            <stop offset="1" stopColor="#c49d68" stopOpacity="0" />
          </radialGradient>
          <filter id={id("blur")} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id={id("soft")} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        {full && (
          <>
            {/* Contact shadow */}
            <ellipse cx={MID} cy={B - 3} rx="150" ry="13" fill="#1d2b31" opacity="0.18" filter={url("soft")} />
            <rect x={L + 6} y={B - 5} width={R - L - 12} height="8" fill="#1d2b31" opacity="0.45" filter={url("blur")} />

            {/* Back handle — loops behind the back panel, peeking out above the front one */}
            <g className="lookbook-bag__handle lookbook-bag__handle--back">
              <path d={rope(true)} fill="none" stroke="#8a6a42" strokeWidth="4.6" />
              <path d={rope(true)} fill="none" stroke="#a8875a" strokeWidth="1.5" strokeDasharray="2.2 1.8" />
            </g>

            {/* Inside — the back panel's lining down to the front edge — and the warm light that
                rises from it while a piece hovers over the bag */}
            <polygon points={OPENING} fill={url("inside")} />
            <line
              x1={L + INSET}
              y1={T - BACK + 0.4}
              x2={R - INSET}
              y2={T - BACK + 0.4}
              stroke="#fff"
              strokeOpacity="0.14"
              strokeWidth="0.8"
            />
            <polygon className="lookbook-bag__glow" points={OPENING} fill={url("glow")} opacity="0" />
          </>
        )}

        {/* Side gussets folding in at the top corners */}
        <polygon points={WEDGE_L} fill="#35525d" />
        <polygon points={WEDGE_R} fill="#253b44" />

        {/* Front face: paper, light, turned-over hem, wordmark */}
        <rect x={L} y={T} width={R - L} height={B - T} fill={url("face")} />
        <rect x={L} y={T} width={R - L} height={B - T} fill={url("sheen")} />
        <rect x={L} y={T} width={R - L} height={B - T} fill={url("base")} />
        <rect x={L} y={T} width={R - L} height="13" fill="#fff" fillOpacity="0.035" />
        <line x1={L} y1={T + 13} x2={R} y2={T + 13} stroke="#000" strokeOpacity="0.16" strokeWidth="0.8" />
        <line x1={L} y1={T + 0.4} x2={R} y2={T + 0.4} stroke="#fff" strokeOpacity="0.18" strokeWidth="0.8" />
        <image href="/logo.svg" x={MID - 72} y={T + 86} width="144" height="14" />
        <text
          x={MID}
          y={T + 116}
          fill="#fff"
          fillOpacity="0.62"
          fontFamily="futura, 'Century Gothic', sans-serif"
          fontSize="6.4"
          letterSpacing="2.6"
          textAnchor="middle"
        >
          {LOOKBOOK_SEASON.toUpperCase()}
        </text>

        {/* Eyelets */}
        {[MID - HOLE_X, MID + HOLE_X].map((x) => (
          <g key={x}>
            <circle cx={x} cy={HOLE_Y} r="4" fill="#c9a46f" />
            <circle cx={x} cy={HOLE_Y} r="2.1" fill="#132028" />
          </g>
        ))}

        {/* Front handle */}
        <g className="lookbook-bag__handle lookbook-bag__handle--front">
          <path d={rope()} fill="none" stroke="#b48d59" strokeWidth="4.6" />
          <path d={rope()} fill="none" stroke="#e2c897" strokeWidth="1.5" strokeDasharray="2.2 1.8" />
        </g>
      </svg>
    </div>
  );
};

export default LookbookBag;
