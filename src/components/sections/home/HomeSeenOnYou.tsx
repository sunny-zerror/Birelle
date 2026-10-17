import { Link } from "next-view-transitions";
import { RiAddLine } from "@remixicon/react";

type Hotspot = {
  x: number; // % from left
  y: number; // % from top
  title: string;
  href: string;
};

type Look = {
  image: string;
  alt: string;
  hotspots: Hotspot[];
};

const looks: Look[] = [
  {
    image: "/images/homepage/seen_on_you/img1.jpeg",
    alt: "Customer in a portrait-print tee and painted trouser on a city street",
    hotspots: [
      { x: 27.6, y: 44.7, title: "Portrait Tee", href: "/shop/portrait-tee" },
      { x: 66.7, y: 88.7, title: "Painted Wide Trouser", href: "/shop/painted-wide-trouser" },
    ],
  },
  {
    image: "/images/homepage/seen_on_you/img2.jpeg",
    alt: "Customer seated on stone steps in a painted-sleeve tee",
    hotspots: [
      { x: 51.4, y: 26.2, title: "Painted Sleeve Tee", href: "/shop/painted-sleeve-tee" },
      { x: 73.3, y: 88.7, title: "Painted Wide Trouser", href: "/shop/painted-wide-trouser" },
    ],
  },
  {
    image: "/images/homepage/seen_on_you/img3.jpeg",
    alt: "Customer in a portrait-print tank leaning in a gallery doorway",
    hotspots: [
      { x: 42.9, y: 41.8, title: "The Painter's Tank", href: "/shop/painters-tank" },
      { x: 68.6, y: 88.7, title: "Splash Trouser", href: "/shop/splash-trouser" },
    ],
  },
  {
    image: "/images/homepage/seen_on_you/img4.jpeg",
    alt: "Close portrait of a customer in a black printed tee",
    hotspots: [{ x: 36.7, y: 72.3, title: "Signature Tee", href: "/shop/signature-tee" }],
  },
];

const HomeSeenOnYou = () => {
  return (
    <section id="home-seen-on-you" className="home-seen-on-you section bg-white">
      <div className="home-seen-on-you__inner container">
        <header className="text-center">
          <h2 className="primary-font font-normal uppercase text-deep">As Seen On You</h2>
          <p className="mt-2 text-sm">Shop our best looks, styled by you.</p>
        </header>

        <div className="mt-stack grid grid-cols-2 gap-3  md:grid-cols-4 md:gap-5">
          {looks.map((look) => (
            <figure key={look.image} className="home-seen-on-you__look relative aspect-3/4">
              <div className="absolute inset-0 overflow-hidden bg-neutral-100">
                <img src={look.image} alt={look.alt} className="cover" loading="lazy" />
              </div>

              {/* Shoppable hotspots — tooltip opens on hover or keyboard focus */}
              {look.hotspots.map((spot) => (
                <div
                  key={spot.title + spot.x}
                  className="group/spot absolute -translate-x-1/2 -translate-y-1/2 hover:z-20 focus-within:z-20"
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                >
                  <Link
                    href={spot.href}
                    aria-label={`Shop ${spot.title}`}
                    className="center size-7 rounded-full bg-white text-ink transition-transform duration-300 group-hover/spot:scale-110 md:size-9"
                  >
                    <RiAddLine size={18} className="transition-transform duration-300 group-hover/spot:rotate-90" />
                  </Link>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap bg-white px-3 py-2 text-xs uppercase text-ink opacity-0 transition-[opacity,translate] duration-300 group-hover/spot:translate-y-0 group-hover/spot:opacity-100 group-focus-within/spot:translate-y-0 group-focus-within/spot:opacity-100"
                  >
                    {spot.title}
                  </span>
                </div>
              ))}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeSeenOnYou;
