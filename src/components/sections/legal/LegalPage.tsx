import { Link } from "next-view-transitions";
import { siteConfig } from "@/config/site";
import type { LegalBlock, LegalDoc } from "@/data/legal";
import { formatDate } from "@/utils/date";
import LegalToc from "./LegalToc";

const Block = ({ block }: { block: LegalBlock }) => {
  if (typeof block === "string") return <p>{block}</p>;

  if ("list" in block)
    return (
      <ul className="flex flex-col gap-2.5">
        {block.list.map((item) => (
          <li key={item} className="relative pl-5 before:absolute before:left-0 before:top-[0.6em] before:h-px before:w-2.5 before:bg-ink/40">
            {item}
          </li>
        ))}
      </ul>
    );

  if ("table" in block)
    return (
      // Scrolls sideways on narrow screens rather than squashing
      <div className="scroller_none -mx-gutter overflow-x-auto px-gutter md:mx-0 md:px-0">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink/30">
              {block.table.head.map((h) => (
                <th key={h} scope="col" className="secondary-font py-3 pr-4 text-xs font-normal uppercase tracking-wide text-ink">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.table.rows.map((row) => (
              <tr key={row[0]} className="border-b border-line align-top">
                {row.map((cell, i) => (
                  <td key={i} className={`py-3 pr-4 ${i === 0 ? "font-mono text-xs text-ink" : ""}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

  // Standard contact line
  return (
    <p>
      Get in touch through our{" "}
      <Link href="/contact" className="text-ink underline underline-offset-4 hover:opacity-60">
        contact page
      </Link>
      {siteConfig.contact.email && (
        <>
          {" "}or email{" "}
          <Link href={`mailto:${siteConfig.contact.email}`} target="_top" className="text-ink underline underline-offset-4 hover:opacity-60">
            {siteConfig.contact.email}
          </Link>
        </>
      )}
      .
    </p>
  );
};

// Shared layout for Privacy, Terms and Cookies: title band, sticky contents, numbered sections
const LegalPage = ({ doc }: { doc: LegalDoc }) => (
  <article className="legal bg-white pb-section pt-[calc(var(--spacing-header)+2.5rem)] md:pt-[calc(var(--spacing-header)+4.5rem)]">
    <div className="container">
      <header className="max-w-3xl animate-panel-in">
        <p className="text-xs uppercase tracking-wide text-muted">{doc.eyebrow}</p>
        <h1 className="primary-font mt-4 text-3xl font-normal uppercase text-ink md:text-5xl">{doc.title}</h1>
        <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">{doc.intro}</p>
        <p className="mt-6 text-xs text-muted">
          Last updated <time dateTime={doc.updated}>{formatDate(doc.updated)}</time>
        </p>
      </header>

      <div className="mt-10 grid gap-10 border-t border-line pt-8 md:mt-14 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-20 lg:pt-14 xl:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:self-start">
          <LegalToc items={doc.sections.map(({ id, title }) => ({ id, title }))} />
        </aside>

        <div className="max-w-3xl">
          {doc.sections.map((section, i) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
              className="scroll-mt-[calc(var(--spacing-header)+1.5rem)] border-b border-line py-8 first:pt-0 last:border-b-0 md:py-10"
            >
              <h2 id={`${section.id}-title`} className="flex items-baseline gap-4 text-ink">
                <span className="text-xs tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="secondary-font text-base uppercase tracking-wide md:text-lg">{section.title}</span>
              </h2>
              <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-ink/80 md:pl-9 md:text-[0.9375rem]">
                {section.blocks.map((block, j) => (
                  <Block key={j} block={block} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  </article>
);

export default LegalPage;
