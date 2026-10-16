import Button from "@/components/ui/Button";

const HomeLookbook = () => {
  return (
    <section id="home-lookbook" className="home-lookbook relative bg-white">
      {/* Editorial plate — two looks framing the centre column */}
      <div className="home-lookbook__media relative aspect-1440/931 w-full overflow-hidden">
        <img
          src="/images/homepage/lookbook/main_bg.svg"
          alt="Two looks from the Limitless collection shown in profile"
          className="cover"
          loading="lazy"
        />

        {/* Centre copy sits in the gap between the figures from md up */}
        <div className="home-lookbook__copy absolute inset-0 hidden md:block">
          <div className="absolute inset-x-0 top-[31%] mx-auto flex max-w-[18rem] flex-col items-center text-center">
            <h2 className="primary-font font-normal text-h-lookbook uppercase text-deep">Limitless</h2>
            <p className="mt-4 text-sm  text-ink">
              {"BIRELLE explores timeless form, quiet confidence, and freedom without boundaries."}
            </p>
          </div>
          <div className="absolute inset-x-0 top-[78%] flex justify-center">
            <Button type="bracket" href="/lookbook" className="home-lookbook__cta">View Lookbook</Button>
          </div>
        </div>
      </div>

      {/* Mobile copy stacks under the plate */}
      <div className="home-lookbook__copy-mobile container flex flex-col items-center pb-10 pt-6 text-center md:hidden">
        <h2 className="primary-font font-normal text-h-lookbook text-deep">Limitless</h2>
        <p className="mt-3 max-w-[16rem] text-caption text-ink">
          {"BIRELLE explores timeless form, quiet confidence, and freedom without boundaries."}
        </p>
        <Button type="bracket" href="/lookbook" className="home-lookbook__cta mt-6">View Lookbook</Button>
      </div>
    </section>
  );
};

export default HomeLookbook;
