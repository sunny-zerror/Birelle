import { Link } from "next-view-transitions";

type ButtonProps = {
  children: React.ReactNode;
  /** deep: slate block (default) · light: white block for use over photography */
  variant?: "deep" | "light";
  className?: string;
} & (
  | { href: string; onClick?: never }
  // An action rather than a page (e.g. opening a dialog) renders a real <button>
  | { onClick: () => void; href?: never }
);

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

const variants = {
  deep: "bg-deep text-white",
  light: "bg-white text-ink",
};

// Filled block — on hover the gap opens and an arrow scales in from its left edge
const Button = ({ href, onClick, children, variant = "deep", className = "" }: ButtonProps) => {
  const classes = `button whitespace-nowrap group secondary-font inline-flex items-center gap-0 ${variants[variant]} px-6 py-3 text-sm uppercase leading-none transition-[gap] duration-500 ${ease} hover:gap-2 ${className}`;
  const content = (
    <>
      {children}
      <span
        aria-hidden="true"
        className={`inline-block w-0 origin-left scale-x-0 overflow-hidden transition-[width,scale] duration-500 ${ease} group-hover:w-3.5 group-hover:scale-x-100`}
      >
        →
      </span>
    </>
  );

  return href !== undefined ? (
    <Link href={href} className={classes}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
};

export default Button;
