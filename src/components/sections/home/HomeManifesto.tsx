const phrase = "Inspired by movement and crafted without limit";

const HomeManifesto = () => {
  return (
    <section
      id="home-manifesto"
      aria-label={phrase}
      className="home-manifesto overflow-hidden bg-white py-section"
    >
      {/* Two identical halves so a -50% translate loops seamlessly */}
      <div aria-hidden="true" className="flex w-max animate-marquee motion-reduce:animate-none">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className=" h2 whitespace-nowrap pr-[0.9rem] uppercase text-deep"
              >
                {phrase} | 
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomeManifesto;
