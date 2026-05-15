import { getChapters } from "./chapter/utils";

export const baseUrl = "https://lattice-cryptography.conor.computer";

export default async function sitemap() {
  const chapters = getChapters().map((chapter) => ({
    url: `${baseUrl}/chapter/${chapter.slug}`,
    lastModified: chapter.metadata.publishedAt,
  }));

  const routes = [""].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...chapters];
}
