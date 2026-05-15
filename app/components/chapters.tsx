import Link from "next/link";
import { getChapters } from "../chapter/utils";
import { groupChaptersByPart } from "../chapter/parts";

export function Chapters() {
  const chapters = getChapters().map((c) => ({
    slug: c.slug,
    chapter: c.metadata.chapter,
    title: c.metadata.title,
    status: c.metadata.status,
  }));
  const hasDrafts = chapters.some((c) => c.status === "draft");
  const grouped = groupChaptersByPart(chapters);

  return (
    <div className="space-y-10">
      {hasDrafts && (
        <p className="text-sm text-muted">
          Chapters marked{" "}
          <span className="inline-flex items-center rounded-full border border-[hsl(var(--border))] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider align-middle">
            Soon
          </span>{" "}
          are still being written.
        </p>
      )}
      {grouped.map((group) => (
        <section key={group.title ?? "ungrouped"} className="space-y-4">
          {group.title && (
            <h3 className="text-sm font-medium text-muted uppercase tracking-wide">
              {group.title}
            </h3>
          )}
          <div className="space-y-3">
            {group.items.map((chapter) => {
              const isDraft = chapter.status === "draft";
              const row = (
                <article className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                  <h3 className="text-muted text-sm font-sans tabular-nums shrink-0">
                    {chapter.chapter}
                  </h3>
                  <h3
                    className={
                      isDraft
                        ? "text-muted"
                        : "group-hover:text-[hsl(var(--accent))] transition-colors"
                    }
                  >
                    {chapter.title}
                    {isDraft && (
                      <span className="ml-2 inline-flex items-center rounded-full border border-[hsl(var(--border))] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted align-middle">
                        Soon
                      </span>
                    )}
                  </h3>
                </article>
              );

              if (isDraft) {
                return (
                  <div
                    key={chapter.slug}
                    aria-disabled="true"
                    className="block opacity-60 cursor-not-allowed select-none"
                  >
                    {row}
                  </div>
                );
              }

              return (
                <Link
                  key={chapter.slug}
                  href={`/chapter/${chapter.slug}`}
                  className="group block"
                >
                  {row}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
