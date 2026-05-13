import { baseUrl } from "./../sitemap";
import { getChapters } from "../chapter/utils";

export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  const allChapters = getChapters();

  const itemsXml = allChapters
    .sort((a, b) => {
      if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
        return -1;
      }
      return 1;
    })
    .map(
      (chapter) =>
        `<item>
          <title>${chapter.metadata.title}</title>
          <link>${baseUrl}/chapter/${chapter.slug}</link>
          <description>${chapter.metadata.summary || ""}</description>
          <pubDate>${new Date(chapter.metadata.publishedAt).toUTCString()}</pubDate>
        </item>`,
    )
    .join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
        <title>Conor Deegan</title>
        <link>${baseUrl}</link>
        <description>Thoughts made into words.</description>
        ${itemsXml}
    </channel>
  </rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}
