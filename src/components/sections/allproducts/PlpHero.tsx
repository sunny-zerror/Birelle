const PlpHero = () => {
  return (
    <section id="plp-hero" data-hero className="plp-hero relative h-[70vh] overflow-hidden bg-ink">
      <img
        src="/images/productpage/plp_hero.png"
        alt="Painted portrait mural framed by orange nasturtiums in a sunlit glasshouse"
        className="plp-hero__media cover animate-hero-settle motion-reduce:animate-none"
        fetchPriority="high"
      />
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/30 to-transparent" />
    </section>
  );
};

export default PlpHero;
