import Button from "@/components/ui/Button";

const HomeCollection = () => {
  return (
    <section id="home-collection" className="home-collection relative overflow-hidden bg-white pb-section pt-[4vw]">
      {/* Headline sits behind the figure, which overlaps lines two and three */}
      <div className="home-collection__stage relative">
        <h2 className="home-collection__title primary-font absolute inset-x-0 top-0 z-0 text-center text-[11.5vw] font-normal uppercase leading-[0.89] text-deep">
          Beyond
          <br />
          The Ordinary
          <br />
          20<span className="opacity-0">.....</span>26
        </h2>

        <img
          src="/images/homepage/beyond_ordinary_section/standing_person.svg"
          alt="Model wearing a hand-painted tank and printed wide-leg trouser"
          width={371}
          height={631}
          loading="lazy"
          className="home-collection__figure relative z-10 mx-auto block h-auto w-[80vw] md:w-[26vw] pt-[8.5vw]"
        />
      </div>

      <div className="home-collection__foot container mt-6 flex flex-col items-start gap-6 md:mt-0 md:flex-row md:items-end md:justify-between">
        <p className="md:max-w-sm text-sm leading-tight text-ink">
          A collection shaped by uninhibited movement and contemporary expression, where expressive prints, and
          considered details come together without boundaries.
        </p>
        <Button type="solid" href="/collection">
          Discover the Collection
        </Button>
      </div>
    </section>
  );
};

export default HomeCollection;
