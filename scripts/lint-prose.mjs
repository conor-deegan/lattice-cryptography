#!/usr/bin/env node
// Deterministic style checks for course chapters.
//
//   node scripts/lint-prose.mjs                  lint every chapter
//   node scripts/lint-prose.mjs <file> [...]     lint named files
//   node scripts/lint-prose.mjs --strict         warnings fail too
//   node scripts/lint-prose.mjs --quiet          only print failures
//
// Exit 1 if any error is found (or any warning under --strict), else 0.

import fs from "fs";
import path from "path";
import {
  STRUCTURE_EXEMPT, listChapters, readChapter, maskForProse,
  mathSpans, lineCol, isStub, wordCount, paragraphs, sentences,
} from "./lib/mdx.mjs";
import {
  BANNED_PHRASES, AMERICAN_SPELLINGS, IZE_SAFELIST, IZE_PATTERN, PROPER_NOUNS,
} from "./lib/rules.mjs";

const SENTENCE_MAX = 32;   // words; p99 of the published chapters is 30
const PARAGRAPH_MAX = 90;  // words; p95 of the published chapters is 41

const argv = process.argv.slice(2);
const strict = argv.includes("--strict");
const quiet = argv.includes("--quiet");
const files = argv.filter((a) => !a.startsWith("--"));

const findings = [];
function report(file, line, col, level, rule, message) {
  findings.push({ file, line, col, level, rule, message });
}

// ---------------------------------------------------------------- checks

function checkFrontmatter(ch, allMeta) {
  const { meta, slug, file, sources } = ch;
  const at = (key) => meta[`__line_${key}`] || 1;

  if (slug !== "demo") {
    for (const key of ["title", "publishedAt", "summary", "chapter", "status"]) {
      if (!meta[key]) {
        report(file, 1, 1, "error", "frontmatter/required",
          `missing required frontmatter field \`${key}\``);
      }
    }
    if (meta.status && !["draft", "published"].includes(meta.status)) {
      report(file, at("status"), 1, "error", "frontmatter/status",
        `status must be 'draft' or 'published', found '${meta.status}'`);
    }
    if (meta.publishedAt && !/^\d{4}-\d{2}-\d{2}$/.test(meta.publishedAt)) {
      report(file, at("publishedAt"), 1, "error", "frontmatter/date",
        `publishedAt must be YYYY-MM-DD, found '${meta.publishedAt}'`);
    }
    if (meta.chapter && !/^\d+$/.test(meta.chapter)) {
      report(file, at("chapter"), 1, "error", "frontmatter/chapter",
        `chapter must be a quoted whole number, found '${meta.chapter}'`);
    }
  }

  if (meta.chapter && /^\d+$/.test(meta.chapter)) {
    const n = parseInt(meta.chapter, 10);
    const clash = allMeta.find((o) => o.slug !== slug && o.chapter === n);
    if (clash) {
      report(file, at("chapter"), 1, "error", "frontmatter/chapter-unique",
        `chapter ${n} is also used by ${clash.slug}`);
    }
    if (n !== 99 && !allMeta.partRanges.some(([lo, hi]) => n >= lo && n <= hi)) {
      report(file, at("chapter"), 1, "error", "frontmatter/chapter-range",
        `chapter ${n} falls outside every part range in app/chapter/parts.ts`);
    }
  }

  const ids = new Set();
  for (const s of sources) {
    if (!s.id) {
      report(file, s.line, 1, "error", "sources/format",
        "source entries must be `  - <id>: <url>`");
      continue;
    }
    if (!/^[a-z0-9][a-z0-9._-]*$/.test(s.id)) {
      report(file, s.line, 1, "error", "sources/id",
        `source id '${s.id}' must be lowercase letters, digits, dot, dash or underscore`);
    }
    if (ids.has(s.id)) {
      report(file, s.line, 1, "error", "sources/duplicate",
        `duplicate source id '${s.id}'`);
    }
    ids.add(s.id);
    if (!/^https?:\/\//.test(s.url)) {
      report(file, s.line, 1, "error", "sources/url",
        `source '${s.id}' must point at an http(s) URL`);
    }
  }
  if ("sources" in meta && sources.length === 0) {
    report(file, at("sources") || 1, "error", "sources/empty",
      "`sources:` is present but lists no entries");
  }
}

// Typography and banned wording. Runs over frontmatter and masked body alike.
function checkText(file, text, offsetLine, { isFrontmatter = false } = {}) {
  const line = (i) => lineCol(text, i).line + offsetLine - 1;
  const col = (i) => lineCol(text, i).col;
  let m;

  const emDash = /—/g;
  while ((m = emDash.exec(text)) !== null) {
    report(file, line(m.index), col(m.index), "error", "typography/em-dash",
      "em dash is banned; use a comma, semicolon, colon, spaced hyphen or full stop");
  }

  const enDash = /–/g;
  while ((m = enDash.exec(text)) !== null) {
    report(file, line(m.index), col(m.index), "warning", "typography/en-dash",
      "en dash reads as an em dash on the page; prefer a hyphen or rewrite");
  }

  const curly = /[‘’“”]/g;
  while ((m = curly.exec(text)) !== null) {
    const hint = isFrontmatter
      ? "; switch the YAML value to double quotes so a straight apostrophe fits"
      : "";
    report(file, line(m.index), col(m.index), "error", "typography/curly-quote",
      `use straight quotes only${hint}`);
  }

  for (const phrase of BANNED_PHRASES) {
    const re = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    while ((m = re.exec(text)) !== null) {
      report(file, line(m.index), col(m.index), "error", "prose/banned-phrase",
        `banned phrase "${m[0]}"`);
    }
  }

  const spellRe = new RegExp(`\\b(${Object.keys(AMERICAN_SPELLINGS).join("|")})\\b`, "gi");
  while ((m = spellRe.exec(text)) !== null) {
    const british = AMERICAN_SPELLINGS[m[0].toLowerCase()];
    report(file, line(m.index), col(m.index), "error", "prose/british-english",
      `"${m[0]}" is American; use "${british}"`);
  }

  IZE_PATTERN.lastIndex = 0;
  while ((m = IZE_PATTERN.exec(text)) !== null) {
    if (IZE_SAFELIST.has(m[0].toLowerCase())) continue;
    const british = m[0].replace(/iz/g, "is").replace(/yz/g, "ys");
    report(file, line(m.index), col(m.index), "error", "prose/british-english",
      `"${m[0]}" is American; use "${british}"`);
  }
}

function checkMaths(ch) {
  const { file, body, bodyLine } = ch;
  for (const span of mathSpans(body)) {
    const at = (i) => {
      const { line, col } = lineCol(body, span.start + i);
      return [line + bodyLine - 1, col];
    };
    let m;

    const cmp = /<=|>=/g;
    while ((m = cmp.exec(span.text)) !== null) {
      const [l, c] = at(m.index);
      report(file, l, c, "error", "maths/leq",
        `use \\${m[0] === "<=" ? "leq" : "geq"} instead of ${m[0]} in maths`);
    }

    const sub = /(?<![\\A-Za-z0-9_])([A-Za-z])([0-9])(?![0-9A-Za-z])/g;
    while ((m = sub.exec(span.text)) !== null) {
      const [l, c] = at(m.index);
      report(file, l, c, "error", "maths/subscript",
        `write $${m[1]}_${m[2]}$, not $${m[0]}$`);
    }

    const norm = /(?<!\\)\|\|/g;
    while ((m = norm.exec(span.text)) !== null) {
      const [l, c] = at(m.index);
      report(file, l, c, "error", "maths/norm",
        "use \\|x\\| for norms, not ||x||");
    }

    // Set literals only: a brace opening a group that reads as a set.
    const set = /(?:^|[\s=(,:])\{([^{}]*)\}/g;
    while ((m = set.exec(span.text)) !== null) {
      if (!/[,:]|\\mid/.test(m[1])) continue;
      const [l, c] = at(m.index);
      report(file, l, c, "error", "maths/set-braces",
        "use \\{...\\} for sets in LaTeX, not bare {...}");
    }
  }
}

function checkStructure(ch) {
  const { file, body, bodyLine, meta, slug } = ch;
  const stub = isStub(body);
  const published = meta.status === "published";
  const exempt = STRUCTURE_EXEMPT.has(slug);
  const at = (i) => {
    const { line, col } = lineCol(body, i);
    return [line + bodyLine - 1, col];
  };
  let m;

  const h1 = /^#\s+\S/gm;
  while ((m = h1.exec(body)) !== null) {
    const [l, c] = at(m.index);
    report(file, l, c, "error", "structure/h1",
      "the chapter title comes from frontmatter; start body headings at ##");
  }

  const headings = [];
  const hRe = /^(#{1,6})\s+(.+)$/gm;
  while ((m = hRe.exec(body)) !== null) {
    headings.push({ level: m[1].length, text: m[2].trim(), index: m.index });
  }

  let previous = 1;
  for (const h of headings) {
    if (h.level > previous + 1) {
      const [l, c] = at(h.index);
      report(file, l, c, "error", "structure/heading-skip",
        `heading jumps from h${previous} to h${h.level}`);
    }
    previous = h.level;

    const words = h.text.replace(/\$[^$]*\$/g, "").replace(/`[^`]*`/g, "").split(/\s+/);
    words.slice(1).forEach((w) => {
      const bare = w.replace(/[^A-Za-z-]/g, "");
      if (!bare || !/^[A-Z]/.test(bare)) return;
      if (/^[A-Z0-9-]+$/.test(bare)) return;      // acronym
      if (PROPER_NOUNS.has(bare)) return;
      const [l, c] = at(h.index);
      report(file, l, c, "warning", "structure/sentence-case",
        `headings are sentence case; "${bare}" is capitalised mid-heading`);
    });
  }

  const diagram = /\[Diagram:/g;
  while ((m = diagram.exec(body)) !== null) {
    if (!published) continue;
    const [l, c] = at(m.index);
    report(file, l, c, "error", "structure/diagram-placeholder",
      "a published chapter must not ship a [Diagram: ...] placeholder");
  }

  if (published && !exempt && !stub && !/^##\s+What to remember\s*$/m.test(body)) {
    report(file, bodyLine, 1, "error", "structure/what-to-remember",
      "published chapters must include a `## What to remember` section");
  }

  const comment = /\{\/\*\s*(src|unsourced)\s*:?\s*([^*]*)\*\/\}/g;
  while ((m = comment.exec(body)) !== null) {
    if (m[1] === "src" && !/^[a-z0-9][a-z0-9._-]*\s*$/.test(m[2])) {
      const [l, c] = at(m.index);
      report(file, l, c, "error", "sources/marker",
        `malformed source marker; write {/* src:<id> */}`);
    }
  }
}

function checkLength(ch) {
  const { file, body, bodyLine } = ch;
  const masked = maskForProse(body);
  for (const para of paragraphs(masked)) {
    const words = wordCount(para.text);
    if (words > PARAGRAPH_MAX) {
      const { line } = lineCol(body, para.start);
      report(file, line + bodyLine - 1, 1, "warning", "length/paragraph",
        `paragraph is ${words} words (limit ${PARAGRAPH_MAX})`);
    }
    for (const s of sentences(para.text)) {
      if (/^\s*By the end\b/.test(s.text)) continue;
      const n = wordCount(s.text);
      if (n > SENTENCE_MAX) {
        const { line } = lineCol(body, para.start + s.start);
        report(file, line + bodyLine - 1, 1, "warning", "length/sentence",
          `sentence is ${n} words (limit ${SENTENCE_MAX})`);
      }
    }
  }
}

// ---------------------------------------------------------------- run

// Part ranges are the single source of truth for which chapter numbers exist.
function partRanges() {
  const src = fs.readFileSync(path.join("app", "chapter", "parts.ts"), "utf8");
  const ranges = [];
  const re = /range:\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]/g;
  let m;
  while ((m = re.exec(src)) !== null) ranges.push([+m[1], +m[2]]);
  return ranges;
}

const targets = files.length ? files : listChapters();
const chapterFiles = targets.filter(
  (f) => f.endsWith(".mdx") && path.resolve(f).includes(path.join("app", "chapter", "chapters")),
);

if (chapterFiles.length) {
  const all = listChapters().map((f) => {
    const ch = readChapter(f);
    return { slug: ch.slug, chapter: parseInt(ch.meta.chapter, 10) };
  });
  all.partRanges = partRanges();

  for (const file of chapterFiles) {
    const ch = readChapter(file);
    checkFrontmatter(ch, all);
    checkText(file, ch.frontmatter, 2, { isFrontmatter: true });
    checkText(file, maskForProse(ch.body), ch.bodyLine);
    checkMaths(ch);
    checkStructure(ch);
    checkLength(ch);
  }
}

const errors = findings.filter((f) => f.level === "error");
const warnings = findings.filter((f) => f.level === "warning");

findings.sort((a, b) =>
  a.file.localeCompare(b.file) || a.line - b.line || a.col - b.col);

let lastFile = null;
for (const f of findings) {
  if (f.file !== lastFile) {
    process.stdout.write(`\n${f.file}\n`);
    lastFile = f.file;
  }
  const tag = f.level === "error" ? "error  " : "warning";
  process.stdout.write(`  ${String(f.line).padStart(4)}:${String(f.col).padEnd(3)} ${tag} ${f.rule.padEnd(28)} ${f.message}\n`);
}

if (!quiet || findings.length) {
  process.stdout.write(
    `\n${chapterFiles.length} file(s) checked: ${errors.length} error(s), ${warnings.length} warning(s)\n`);
}

process.exit(errors.length || (strict && warnings.length) ? 1 : 0);
