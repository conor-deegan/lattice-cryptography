import { getChapters } from "./../utils";
import { baseUrl } from "./../../sitemap";
import { CustomMDX } from "./../../components/mdx";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return getChapters()
    .filter(
      (chapter) =>
        process.env.NODE_ENV !== "production" ||
        chapter.metadata.status !== "draft",
    )
    .map((chapter) => ({ slug: chapter.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const chapter = getChapters().find((chapter) => chapter.slug === params.slug);

  if (!chapter) return;

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = chapter.metadata;
  const ogImage = image ?? `${baseUrl}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${baseUrl}/chapter/${chapter.slug}`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

function getReadingTime(content: string): string {
  const words = content.split(/\s+/).length;
  return `${Math.ceil(words / 200)} min read`;
}

export default async function Content(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const sorted = getChapters().sort(
    (a, b) => parseInt(a.metadata.chapter) - parseInt(b.metadata.chapter),
  );
  const chapter = sorted.find((c) => c.slug === params.slug);

  if (!chapter) notFound();
  if (
    process.env.NODE_ENV === "production" &&
    chapter.metadata.status === "draft"
  ) {
    notFound();
  }

  const currentNum = parseInt(chapter.metadata.chapter);
  const published = sorted.filter((c) => c.metadata.status !== "draft");
  const prev =
    [...published]
      .reverse()
      .find((c) => parseInt(c.metadata.chapter) < currentNum) ?? null;
  const next =
    published.find((c) => parseInt(c.metadata.chapter) > currentNum) ?? null;

  return (
    <article>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: chapter.metadata.title,
            datePublished: chapter.metadata.publishedAt,
            dateModified: chapter.metadata.publishedAt,
            description: chapter.metadata.summary,
            image: chapter.metadata.image
              ? `${baseUrl}${chapter.metadata.image}`
              : `/og?title=${encodeURIComponent(chapter.metadata.title)}`,
            url: `${baseUrl}/chapter/${chapter.slug}`,
            author: { "@type": "Person", name: "Conor Deegan" },
          }),
        }}
      />

      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight leading-tight mb-4">
          {chapter.metadata.title}
        </h1>
        <div className="flex items-center gap-3 text-muted text-sm font-sans">
          <span>{getReadingTime(chapter.content)}</span>
        </div>
      </header>

      <div className="prose">
        <CustomMDX source={chapter.content} />
      </div>

      <nav className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-8">
        {prev ? (
          <Link
            href={`/chapter/${prev.slug}`}
            className="group block sm:text-left"
          >
            <span className="text-muted text-xs font-sans block mb-1">
              ← Previous
            </span>
            <span className="group-hover:text-[hsl(var(--accent))] transition-colors">
              {prev.metadata.title}
            </span>
          </Link>
        ) : (
          <p className="text-muted text-sm italic">
            You&rsquo;re at the origin — keep going!
          </p>
        )}
        {next ? (
          <Link
            href={`/chapter/${next.slug}`}
            className="group block sm:text-right"
          >
            <span className="text-muted text-xs font-sans block mb-1">
              Next →
            </span>
            <span className="group-hover:text-[hsl(var(--accent))] transition-colors">
              {next.metadata.title}
            </span>
          </Link>
        ) : (
          <p className="text-muted text-sm italic sm:text-right">
            From Learning With Errors to learning without them — well done!
          </p>
        )}
      </nav>
    </article>
  );
}
