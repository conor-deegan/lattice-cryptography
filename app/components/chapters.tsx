import { getChapters } from "../chapter/utils";
import Link from "next/link";

export function Chapters() {
  const allChapters = getChapters();

  return (
    <div className="space-y-6">
      {allChapters
        .sort((a, b) => {
          return parseInt(a.metadata.chapter) - parseInt(b.metadata.chapter);
        })
        .map((chapter) => (
          <Link
            key={chapter.slug}
            href={`/chapter/${chapter.slug}`}
            className="group block"
          >
            <article className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
              <h3 className="text-muted text-sm font-sans tabular-nums shrink-0">
                {chapter.metadata.chapter}
              </h3>
              <h3 className="group-hover:text-[hsl(var(--accent))] transition-colors">
                {chapter.metadata.title}
              </h3>
            </article>
          </Link>
        ))}
    </div>
  );
}
