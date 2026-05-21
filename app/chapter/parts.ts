// Logical groupings of chapters shown on the homepage and side nav.
// Parts are UI-only - they are not clickable and do not have pages.
// To re-order, rename, add, or remove a part, edit this list.

export type Part = {
  title: string;
  // Inclusive chapter-number range matched against the `chapter` frontmatter.
  range: [number, number];
};

export const parts: readonly Part[] = [
  { title: "Part 1: The maths you need before lattices", range: [1, 7] },
  { title: "Part 2: Lattices from first principles", range: [8, 13] },
  { title: "Part 3: The hard problems", range: [14, 17] },
  { title: "Part 4: q-ary lattices and the dual", range: [18, 20] },
  { title: "Part 5: SIS, the short relation problem", range: [21, 23] },
  { title: "Part 6: LWE, the noisy equation problem", range: [24, 28] },
  { title: "Part 7: How lattices actually break", range: [29, 31] },
  {
    title: "Part 8: Structure - polynomials, rings, modules",
    range: [32, 37],
  },
  { title: "Part 9: ML-KEM and key encapsulation", range: [38, 39] },
  { title: "Part 10: ML-DSA and Fiat-Shamir signatures", range: [40, 43] },
  { title: "Part 11: Falcon - hash-and-sign signatures", range: [44, 46] },
  {
    title: "Part 12: Shipping it - implementation and migration",
    range: [47, 48],
  },
];

export type ChapterLike = { chapter: string | number };

export type GroupedChapters<T extends ChapterLike> = {
  title: string | null; // null = ungrouped bucket (e.g. the demo chapter)
  items: T[];
}[];

export function groupChaptersByPart<T extends ChapterLike>(
  chapters: readonly T[],
): GroupedChapters<T> {
  const buckets = parts.map((p) => ({ title: p.title, items: [] as T[] }));
  const ungrouped: T[] = [];

  for (const ch of chapters) {
    const n =
      typeof ch.chapter === "string" ? parseInt(ch.chapter, 10) : ch.chapter;
    const idx = parts.findIndex((p) => n >= p.range[0] && n <= p.range[1]);
    if (idx >= 0) buckets[idx].items.push(ch);
    else ungrouped.push(ch);
  }

  const byNumber = (a: T, b: T) =>
    parseInt(String(a.chapter), 10) - parseInt(String(b.chapter), 10);

  buckets.forEach((b) => b.items.sort(byNumber));
  ungrouped.sort(byNumber);

  const result: GroupedChapters<T> = buckets.filter((b) => b.items.length > 0);
  if (ungrouped.length > 0) result.push({ title: null, items: ungrouped });
  return result;
}
