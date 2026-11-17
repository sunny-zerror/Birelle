"use client";

import { useId, useState } from "react";
import { Link } from "next-view-transitions";
import { RiAddLine, RiSearchLine } from "@remixicon/react";
import Button from "@/components/ui/Button";
import { faqGroups, type FaqItem } from "@/data/faq";
import { scrollToSection } from "@/lib/scroll";

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

const Question = ({ item }: { item: FaqItem }) => {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <li className="border-b border-line">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="group flex w-full items-center justify-between gap-6 py-5 text-left text-sm text-ink md:text-[0.9375rem]"
        >
          <span className="transition-opacity group-hover:opacity-60">{item.q}</span>
          {/* Plus turns into a minus */}
          <RiAddLine
            size={18}
            aria-hidden="true"
            className={`shrink-0 transition-transform duration-500 ${ease} ${open ? "rotate-45" : ""}`}
          />
        </button>
      </h3>
      <div
        id={id}
        role="region"
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-500 ${ease} ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="max-w-2xl pb-6 pr-10 text-sm leading-relaxed text-muted">{item.a}</p>
        </div>
      </div>
    </li>
  );
};

const FaqContent = () => {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const groups = faqGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => !q || `${i.q} ${i.a}`.toLowerCase().includes(q)) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="mt-10 grid gap-10 border-t border-line pt-8 md:mt-14 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-20 lg:pt-14 xl:grid-cols-[17rem_minmax(0,1fr)]">
      {/* Search + topics */}
      <aside className="lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:self-start">
        <label className="flex items-center gap-3 border-b border-ink/30 transition-colors focus-within:border-ink">
          <RiSearchLine size={16} aria-hidden="true" className="shrink-0 text-muted" />
          <span className="sr-only">Search questions</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions"
            className="h-12 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
        </label>

        <nav aria-label="FAQ topics" className="mt-6">
          <ul className="scroller_none -mx-gutter flex gap-2 overflow-x-auto px-gutter lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0">
            {faqGroups.map((g) => (
              <li key={g.id} className="shrink-0">
                <Link
                  href={`#${g.id}`}
                  scroll={false}
                  onClick={(e) => scrollToSection(e, g.id)}
                  className="flex h-9 items-center whitespace-nowrap border border-ink/30 px-4 text-xs text-ink transition-colors duration-300 hover:border-ink lg:h-auto lg:border-0 lg:px-0 lg:py-2 lg:text-sm lg:text-muted lg:hover:text-ink"
                >
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Questions */}
      <div className="max-w-3xl">
        {groups.length === 0 ? (
          <p className="animate-panel-in py-10 text-sm text-muted">
            No questions match “{query}”. Try another word, or contact us below.
          </p>
        ) : (
          <div className="flex flex-col gap-12 md:gap-16">
            {groups.map((g) => (
              <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className="scroll-mt-[calc(var(--spacing-header)+1.5rem)]">
                <h2 id={`${g.id}-title`} className="secondary-font border-b border-ink/30 pb-4 text-base uppercase tracking-wide text-ink md:text-lg">
                  {g.title}
                </h2>
                <ul>
                  {g.items.map((item) => (
                    <Question key={item.q} item={item} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {/* Still stuck */}
        <div className="mt-16 flex flex-col items-start gap-6 bg-neutral-100 p-6 md:mt-20 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <p className="primary-font text-xl text-ink md:text-2xl">Still need help?</p>
            <p className="mt-2 text-sm text-muted">Our Client Advisors are happy to help with anything else.</p>
          </div>
          <Button href="/contact">Contact us</Button>
        </div>
      </div>
    </div>
  );
};

export default FaqContent;
