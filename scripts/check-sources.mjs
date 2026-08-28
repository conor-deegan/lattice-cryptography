#!/usr/bin/env node
// Every factual claim in a written chapter must trace to a primary source.
//
//   node scripts/check-sources.mjs                lint every written chapter
//   node scripts/check-sources.mjs <file> [...]   check named files
//   node scripts/check-sources.mjs --session <id> check files edited this session
//
// The convention:
//   1. Frontmatter carries a `sources:` block list of `  - <id>: <url>` entries.
//   2. A paragraph making a factual claim ends with an MDX comment {/* src:<id> */}.
//      It must be an MDX comment: MDX 3 rejects HTML comments and the build breaks.
//   3. {/* unsourced: <reason> */} records a deliberate exception. Reported, never fatal.
//
// A claim is anything the trigger list in
// .claude/skills/fact-check-chapter/reference/claim-triggers.md describes: a year,
// a standards reference, a named attribution, or a scheme parameter. Maths with
// numbers in it is not a claim, or every worked example would block the turn.

import fs from "fs";
import path from "path";
import {
  STRUCTURE_EXEMPT, listChapters, readChapter, maskForProse, lineCol, isStub, blocks,
} from "./lib/mdx.mjs";
import { ATTRIBUTED_NAMES, SCHEME_NAMES } from "./lib/rules.mjs";

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const TRIGGERS = [
  { id: "year", re: /\b(?:19|20)\d{2}\b/g,
    why: "a year" },
  { id: "standard", re: /\b(?:FIPS\s*\d{3}|RFC\s*\d{3,5}|SP\s*800-\d+[A-Za-z]?|NIST\b|IETF\b|ISO\/IEC\s*\d+)/g,
    why: "a standards reference" },
  { id: "attribution", re: new RegExp(`\\bet al\\.|\\b(?:proposed|introduced|published|showed|proved|invented|discovered|designed) by\\b|\\b(?:${ATTRIBUTED_NAMES.map(esc).join("|")})\\b`, "g"),
    why: "a named attribution" },
  { id: "security-level", re: /\b(?:NIST\s*)?(?:security\s*level|category)\s*[1-5]\b/gi,
    why: "a claimed security level" },
  { id: "scheme-parameter", re: new RegExp(`\\b(?:${SCHEME_NAMES.map(esc).join("|")})\\b[^.]{0,120}?\\b\\d{2,}\\b|\\b\\d{2,}\\b[^.]{0,120}?\\b(?:${SCHEME_NAMES.map(esc).join("|")})\\b`, "g"),
    why: "a scheme parameter or size" },
];

const argv = process.argv.slice(2);
const sessionIndex = argv.indexOf("--session");
const sessionId = sessionIndex >= 0 ? argv[sessionIndex + 1] : null;
const named = argv.filter(
  (a, i) => !a.startsWith("--") && !(sessionIndex >= 0 && i === sessionIndex + 1),
);

function sessionFiles(id) {
  const log = path.join(".claude", ".session-edits", `${id}.txt`);
  if (!fs.existsSync(log)) return [];
  return [...new Set(fs.readFileSync(log, "utf8").split("\n").filter(Boolean))]
    .filter((f) => fs.existsSync(f));
}

let targets = named.length ? named : sessionId ? sessionFiles(sessionId) : listChapters();
targets = targets.filter(
  (f) => f.endsWith(".mdx") &&
    path.resolve(f).includes(path.join("app", "chapter", "chapters")),
);

const findings = [];
function report(file, line, level, rule, message) {
  findings.push({ file, line, level, rule, message });
}

for (const file of targets) {
  const ch = readChapter(file);
  if (STRUCTURE_EXEMPT.has(ch.slug)) continue;
  if (isStub(ch.body)) continue; // an unwritten stub makes no claims yet

  const ids = new Set(ch.sources.filter((s) => s.id).map((s) => s.id));
  const used = new Set();
  const body = ch.body;
  const masked = maskForProse(body);

  // Paragraph boundaries come from the masked text, claims are read from it,
  // markers are read from the raw text at the same offsets.
  for (const { text: block, start } of blocks(masked)) {
    const trimmed = block.trim();
    if (!trimmed || /^#{1,6}\s/.test(trimmed)) continue;

    const raw = body.slice(start, start + block.length);
    const markers = [...raw.matchAll(/\{\/\*\s*src:\s*([a-z0-9][a-z0-9._-]*)\s*\*\/\}/g)]
      .map((m) => m[1]);
    const waived = /\{\/\*\s*unsourced:\s*\S[^*]*\*\/\}/.test(raw);
    const line = lineCol(body, start).line + ch.bodyLine - 1;

    for (const id of markers) {
      used.add(id);
      if (!ids.has(id)) {
        report(file, line, "error", "sources/unknown-id",
          `{/* src:${id} */} does not match any id in the frontmatter sources list`);
      }
    }

    const hits = [];
    for (const t of TRIGGERS) {
      t.re.lastIndex = 0;
      const m = t.re.exec(block);
      if (m) hits.push(`${t.why} ("${m[0].trim().slice(0, 40)}")`);
    }
    if (!hits.length) continue;

    if (waived) {
      report(file, line, "notice", "sources/waived",
        `unsourced claim waived: ${hits.join(", ")}`);
      continue;
    }
    if (!markers.length) {
      report(file, line, "error", "sources/unsourced-claim",
        `paragraph states ${hits.join(", ")} with no {/* src:<id> */} marker`);
    }
  }

  if (ids.size === 0 && findings.some((f) => f.file === file && f.rule === "sources/unsourced-claim")) {
    report(file, 1, "error", "sources/missing-list",
      "chapter makes factual claims but has no `sources:` list in its frontmatter");
  }
  for (const s of ch.sources) {
    if (s.id && !used.has(s.id)) {
      report(file, s.line, "notice", "sources/unused",
        `source '${s.id}' is listed but never cited with {/* src:${s.id} */}`);
    }
  }
}

findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
let lastFile = null;
for (const f of findings) {
  if (f.file !== lastFile) {
    process.stdout.write(`\n${f.file}\n`);
    lastFile = f.file;
  }
  process.stdout.write(`  ${String(f.line).padStart(4)}  ${f.level.padEnd(7)} ${f.rule.padEnd(26)} ${f.message}\n`);
}

const errors = findings.filter((f) => f.level === "error");
process.stdout.write(
  `\n${targets.length} file(s) checked: ${errors.length} unsourced claim error(s), ` +
  `${findings.length - errors.length} notice(s)\n`);
process.exit(errors.length ? 1 : 0);
