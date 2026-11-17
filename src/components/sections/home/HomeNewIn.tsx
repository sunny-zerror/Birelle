import Image from "next/image";
import Button from "@/components/ui/Button";
import { ImageSkeleton } from "@/components/ui/skeleton";

// Full-width campaign banner — a still photograph with the "new in" call to action near its foot
const HomeNewIn = () => (
  <section id="home-new-in" className="home-new-in relative w-full overflow-hidden">
    <ImageSkeleton className="home-new-in__media relative aspect-4/5 w-full md:aspect-video">
      <Image
        src="/images/homepage/full_size_banner.png"
        alt="Model crouching in a palm house in a painted vest and cream trousers with printed side panels"
        fill
        sizes="100vw"
        className="object-cover object-top"
      />
      {/* Soft shade at the foot so the white type always reads */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/45 to-transparent" />
    </ImageSkeleton>

    <div className="home-new-in__content absolute inset-x-0 bottom-[9%] flex flex-col items-center gap-5 px-(--spacing-gutter) text-center text-white">
      <h2  className="primary-font text-[2rem] font-normal uppercase leading-none md:text-[3.25rem]">Explore New In</h2>
      <Button href="/shop" variant="light">
        Shop now
      </Button>
    </div>
  </section>
);

export default HomeNewIn;
