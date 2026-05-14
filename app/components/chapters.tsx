import Link from "next/link";
import { getChapters } from "../chapter/utils";
import { groupChaptersByPart } from "../chapter/parts";

export function Chapters() {
  const grouped = groupChaptersByPart(
    getChapters().map((c) => ({
      slug: c.slug,
      chapter: c.metadata.chapter,
      title: c.metadata.title,
    })),
  );

  return (
    <div className="space-y-10">
      {grouped.map((group) => (
        <section key={group.title ?? "ungrouped"} className="space-y-4">
          {group.title && (
            <h3 className="text-sm font-medium text-muted uppercase tracking-wide">
              {group.title}
            </h3>
          )}
          <div className="space-y-3">
            {group.items.map((chapter) => (
              <Link
                key={chapter.slug}
                href={`/chapter/${chapter.slug}`}
                className="group block"
              >
                <article className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                  <h3 className="text-muted text-sm font-sans tabular-nums shrink-0">
                    {chapter.chapter}
                  </h3>
                  <h3 className="group-hover:text-[hsl(var(--accent))] transition-colors">
                    {chapter.title}
                  </h3>
                </article>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
