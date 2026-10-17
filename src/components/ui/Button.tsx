import { Link } from "next-view-transitions";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// Filled deep-slate block — on hover the gap opens and an arrow scales in from its left edge
const Button = ({ href, children, className = "" }: ButtonProps) => (
  <Link
    href={href}
    className={`button whitespace-nowrap group secondary-font inline-flex items-center gap-0 bg-deep px-6 py-3 text-sm uppercase leading-none text-white transition-[gap] duration-500 ${ease} hover:gap-2 ${className}`}
  >
    {children}
    <span
      aria-hidden="true"
      className={`inline-block w-0 origin-left scale-x-0 overflow-hidden transition-[width,scale] duration-500 ${ease} group-hover:w-3.5 group-hover:scale-x-100`}
    >
      →
    </span>
  </Link>
);

export default Button;
