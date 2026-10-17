import { Link } from "next-view-transitions";
import { formatPrice } from "@/data/products";
import type { Product } from "@/types";

type Props = {
  product: Product;
  pair: Product;
};

const ProductCompleteLook = ({ product, pair }: Props) => {
  return (
    <section id="pdp-complete-look" className="pdp-complete-look bg-white center">

      <div className="center flex-col px-gutter py-section text-center">
        <h6 className="primary-font  font-normal uppercase  text-deep">Complete the Look</h6>

        <Link href={pair.href} className="group mt-8 block w-full max-w-60 md:max-w-xs">
          <div className="relative aspect-3/4 overflow-hidden bg-white">
            <img
              src={pair.image}
              alt={pair.title}
              loading="lazy"
              className="cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            />
          </div>
          <h3 className="secondary-font mt-4 text-sm uppercase text-ink">
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-size-[0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 group-hover:bg-size-[100%_1px]">
              {pair.title}
            </span>
          </h3>
          <p className="mt-1.5 text-base font-semibold text-ink">{formatPrice(pair.price)}</p>
        </Link>
      </div>
    </section>
  );
};

export default ProductCompleteLook;
