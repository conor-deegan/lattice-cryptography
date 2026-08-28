#!/usr/bin/env node
// Which chapter to write next: the lowest-numbered chapter that is not published.
//
//   node scripts/next-chapter.mjs           the next one
//   node scripts/next-chapter.mjs --list N  the next N, to pick from
//   node scripts/next-chapter.mjs --summary how the whole course stands
//
// A chapter is done when its status is 'published'. A drafted but unpublished
// chapter still counts as outstanding, so this walks forward through gaps: if 12
// is published but 10 is still a draft, 10 is next.

import fs from "fs";
import path from "path";
import { listChapters, readChapter, isStub } from "./lib/mdx.mjs";

const argv = process.argv.slice(2);
const listIndex = argv.indexOf("--list");
const count = listIndex >= 0 ? parseInt(argv[listIndex + 1], 10) || 5 : 1;

function parts() {
  const src = fs.readFileSync(path.join("app", "chapter", "parts.ts"), "utf8");
  const out = [];
  const re = /title:\s*["'`]([^"'`]+)["'`],?\s*(?:\n\s*\/\/[^\n]*\n\s*)?range:\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]/g;
  let m;
  while ((m = re.exec(src)) !== null) out.push({ title: m[1], lo: +m[2], hi: +m[3] });
  return out;
}

const allParts = parts();
const partOf = (n) => allParts.find((p) => n >= p.lo && n <= p.hi)?.title ?? "unassigned";

const chapters = listChapters()
  .map(readChapter)
  // `demo` is a component showcase with no status, not a chapter of the course.
  // `getting-started` is a real chapter and is counted, unlike in the lint checks.
  .filter((c) => c.slug !== "demo" && /^\d+$/.test(c.meta.chapter || ""))
  .map((c) => ({
    number: parseInt(c.meta.chapter, 10),
    slug: c.slug,
    title: c.meta.title,
    status: c.meta.status,
    stub: isStub(c.body),
  }))
  .sort((a, b) => a.number - b.number);

const todo = chapters.filter((c) => c.status !== "published");

if (argv.includes("--summary")) {
  const published = chapters.length - todo.length;
  const drafted = todo.filter((c) => !c.stub).length;
  console.log(`${chapters.length} chapters, excluding the demo page`);
  console.log(`  published  ${String(published).padStart(3)}`);
  console.log(`  drafted    ${String(drafted).padStart(3)}   written, not yet published`);
  console.log(`  stub       ${String(todo.length - drafted).padStart(3)}   not written yet`);
  process.exit(0);
}

if (!todo.length) {
  console.log("Nothing outstanding. Every chapter is published.");
  process.exit(0);
}

// `stub` says whether this is a fresh draft or a revision of existing prose.
for (const c of todo.slice(0, count)) {
  const kind = c.stub ? "stub" : "drafted";
  console.log(`${c.number}\t${c.slug}\t${kind}\t${c.title}\t${partOf(c.number)}`);
}

if (count === 1) {
  const done = chapters.length - todo.length;
  const next = todo[0];
  console.error(
    `\n${done}/${chapters.length} published, ${todo.length} outstanding.\n` +
    `Next: ${next.number}. ${next.title}\n` +
    `Part: ${partOf(next.number)}\n` +
    `State: ${next.stub ? "stub, write it from scratch" : "already drafted, this is a revision"}\n` +
    `File: app/chapter/chapters/${next.slug}.mdx\n`,
  );
}
