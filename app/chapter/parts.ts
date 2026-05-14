// Logical groupings of chapters shown on the homepage and side nav.
// Parts are UI-only — they are not clickable and do not have pages.
// To re-order, rename, add, or remove a part, edit this list.

export type Part = {
  title: string;
  // Inclusive chapter-number range matched against the `chapter` frontmatter.
  range: [number, number];
};

export const parts: readonly Part[] = [
  { title: "Part 1: The tools you need before lattices", range: [1, 5] },
  { title: "Part 2: Lattices from first principles", range: [6, 12] },
  { title: "Part 3: The hard problems", range: [13, 16] },
  {
    title: "Part 4: q-ary lattices, the bridge into real crypto",
    range: [17, 18],
  },
  { title: "Part 5: SIS, the short relation problem", range: [19, 21] },
  { title: "Part 6: LWE, the noisy equation problem", range: [22, 26] },
  { title: "Part 7: Rings and modules", range: [27, 30] },
  { title: "Part 8: ML-KEM and key encapsulation", range: [31, 32] },
  { title: "Part 9: ML-DSA and lattice signatures", range: [33, 36] },
  {
    title: "Part 10: Falcon and NTRU",
    range: [37, 40],
  },
  {
    title: "Part 11: Attacks, parameters, and implementation",
    range: [41, 45],
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
