// Shared MDX parsing and masking helpers for the prose linter and the source checker.
//
// Masking replaces a span with spaces of the same length (newlines preserved), so
// every reported line and column still points at the right place in the real file.

import fs from "fs";
import path from "path";

export const CHAPTERS_DIR = path.join("app", "chapter", "chapters");

// Chapters that are structurally exempt: `demo` is a component showcase excluded
// from production builds, `getting-started` is a short front page, not a lesson.
export const STRUCTURE_EXEMPT = new Set(["demo", "getting-started"]);

export function blank(match) {
  return match.replace(/[^\n]/g, " ");
}

export function readChapter(file) {
  const raw = fs.readFileSync(file, "utf8");
  const slug = path.basename(file, path.extname(file));
  return { file, slug, raw, ...parseFrontmatter(raw) };
}

export function listChapters(dir = CHAPTERS_DIR) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .sort()
    .map((f) => path.join(dir, f));
}

// Deliberately more forgiving than app/chapter/utils.ts: it understands the
// `sources:` block list, which the site parser tolerates but ignores.
export function parseFrontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m) {
    return { meta: {}, sources: [], frontmatter: "", body: raw, bodyLine: 1 };
  }
  const frontmatter = m[1];
  const body = raw.slice(m[0].length);
  const bodyLine = raw.slice(0, m[0].length).split("\n").length;

  const meta = {};
  const sources = [];
  const lines = frontmatter.split("\n");
  let inSources = false;

  lines.forEach((line, i) => {
    const lineNo = i + 2; // frontmatter body starts on file line 2
    if (/^sources:\s*$/.test(line)) {
      inSources = true;
      meta.sources = [];
      return;
    }
    const item = /^\s*-\s*([^:\s]+)\s*:\s*(\S.*)$/.exec(line);
    if (inSources && item) {
      sources.push({ id: item[1], url: item[2].trim(), line: lineNo });
      return;
    }
    if (inSources && /^\s*-\s*/.test(line)) {
      sources.push({ id: null, url: null, raw: line, line: lineNo });
      return;
    }
    const kv = /^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/.exec(line);
    if (kv) {
      inSources = false;
      let value = kv[2].trim().replace(/^['"](.*)['"]$/, "$1");
      meta[kv[1]] = value;
      meta[`__line_${kv[1]}`] = lineNo;
    }
  });

  return { meta, sources, frontmatter, body, bodyLine };
}

// Everything a prose rule must not see: code, maths, JSX, MDX comments, link targets.
export function maskForProse(body) {
  let out = body;
  out = out.replace(/```[\s\S]*?```/g, blank);
  out = out.replace(/`[^`\n]*`/g, blank);
  out = out.replace(/\$\$[\s\S]*?\$\$/g, blank);
  out = out.replace(/\$[^$\n]+\$/g, blank);
  out = out.replace(/<([A-Z][A-Za-z0-9]*)\b[^>]*?\/>/gs, blank);
  out = out.replace(/<([A-Z][A-Za-z0-9]*)\b[^>]*?>[\s\S]*?<\/\1>/g, blank);
  out = out.replace(/\{\/\*[\s\S]*?\*\/\}/g, blank);
  out = out.replace(/\]\([^)\s]+\)/g, blank); // link target, keep link text
  out = out.replace(/https?:\/\/\S+/g, blank);
  return out;
}

// Maths spans, with their offset in the original body, for the LaTeX rules.
export function mathSpans(body) {
  const spans = [];
  let stripped = body.replace(/```[\s\S]*?```/g, blank).replace(/`[^`\n]*`/g, blank);
  for (const re of [/\$\$([\s\S]*?)\$\$/g, /\$([^$\n]+)\$/g]) {
    let m;
    while ((m = re.exec(stripped)) !== null) {
      spans.push({ text: m[1], start: m.index + (re.source.startsWith("\\$\\$") ? 2 : 1) });
    }
    stripped = stripped.replace(re, blank);
  }
  return spans;
}

export function lineCol(text, index) {
  const before = text.slice(0, index);
  const line = before.split("\n").length;
  const col = index - before.lastIndexOf("\n");
  return { line, col };
}

// A stub is an unwritten chapter: a placeholder paragraph or a TODO outline.
export function isStub(body) {
  if (/^##\s+TODO\s*$/m.test(body)) return true;
  return wordCount(maskForProse(body)) < 200;
}

export function wordCount(text) {
  return (text.trim().match(/\S+/g) || []).length;
}

// Every blank-line-separated block, with its exact offset in the text passed in.
// The separator is captured rather than assumed to be two characters: masking
// turns a display-maths block into whitespace-only lines, which then read as a
// separator of some other length. Assuming 2 drifts every later line number.
export function blocks(masked) {
  const out = [];
  const parts = masked.split(/(\n[ \t]*\n)/);
  let offset = 0;
  for (let i = 0; i < parts.length; i += 2) {
    out.push({ text: parts[i], start: offset });
    offset += parts[i].length + (parts[i + 1] ? parts[i + 1].length : 0);
  }
  return out;
}

export function paragraphs(masked) {
  return blocks(masked).filter(({ text }) => {
    const trimmed = text.trim();
    return (
      trimmed &&
      !/^#{1,6}\s/.test(trimmed) &&
      !/^[|>]/.test(trimmed) &&
      !/^([-*+]|\d+\.)\s/.test(trimmed)
    );
  });
}

const ABBREV = /\b(e\.g|i\.e|et al|vs|cf|Fig|approx|Dr|Mr|Ms|no)\.$/i;

export function sentences(paragraph) {
  const parts = [];
  let buffer = "";
  let start = 0;
  const raw = paragraph.split(/(?<=[.!?])(\s+)/);
  for (let i = 0; i < raw.length; i += 2) {
    const chunk = raw[i];
    const gap = raw[i + 1] || "";
    buffer += chunk;
    const endsMidNumber = /\d\.$/.test(chunk) && /^\d/.test(raw[i + 2] || "");
    if (ABBREV.test(chunk) || endsMidNumber) {
      buffer += gap;
      continue;
    }
    parts.push({ text: buffer, start });
    start += buffer.length + gap.length;
    buffer = "";
  }
  if (buffer.trim()) parts.push({ text: buffer, start });
  return parts;
}
