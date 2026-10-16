import { Link } from "next-view-transitions";

type ButtonProps = {
  href: string;
  type?: "bracket" | "solid";
  children: React.ReactNode;
  className?: string;
};

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// type="bracket": "[ LABEL ]" — on hover the brackets open out and an underline drops in and fades up
// type="solid":   filled deep-slate block with a trailing arrow that nudges right on hover
const Button = ({ href, type = "bracket", children, className = "" }: ButtonProps) => {
  if (type === "solid") {
    return (
      <Link
        href={href}
        className={`button button--solid group secondary-font inline-flex h-12 items-center gap-2 bg-deep px-6 text-sm uppercase leading-none text-white transition-colors duration-500 ${ease} hover:bg-ink md:h-14 ${className}`}
      >
        {children}
        <span aria-hidden="true" className={`transition-transform duration-500 ${ease} group-hover:translate-x-1`}>
          →
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`button button--bracket text-sm group primary-font inline-flex items-center gap-1.5 uppercase leading-none text-ink transition-[gap] duration-500 ${ease} hover:gap-3 ${className}`}
    >
      <span aria-hidden="true">[</span>
      <span className="relative pb-0.5">
        {children}
        <span
          aria-hidden="true"
          className={`absolute inset-x-0 bottom-2 h-px bg-current opacity-0 transition-[bottom,opacity] duration-500 ${ease} group-hover:bottom-0 group-hover:opacity-100`}
        />
      </span>
      <span aria-hidden="true">]</span>
    </Link>
  );
};

export default Button;
