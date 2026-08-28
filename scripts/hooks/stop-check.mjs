#!/usr/bin/env node
// Stop hook: refuse to end the turn while a chapter edited in this session
// carries an unsourced factual claim, or still fails the style linter.
//
// Scope is deliberately the session's own edits. Blocking on the 40+ chapters
// that predate this convention would make the harness unusable.

import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const MAX_BLOCKS = 3; // then let the turn end rather than trap it in a loop

let input = "";
process.stdin.on("data", (c) => (input += c));
process.stdin.on("end", () => {
  let payload = {};
  try { payload = JSON.parse(input || "{}"); } catch { process.exit(0); }

  const projectDir = process.env.CLAUDE_PROJECT_DIR || payload.cwd || process.cwd();
  const sessionId = payload.session_id;
  if (!sessionId) process.exit(0);

  const dir = path.join(projectDir, ".claude", ".session-edits");
  const log = path.join(dir, `${sessionId}.txt`);
  if (!fs.existsSync(log)) process.exit(0);

  const files = [...new Set(fs.readFileSync(log, "utf8").split("\n").filter(Boolean))]
    .filter((f) => fs.existsSync(path.join(projectDir, f)));
  if (!files.length) process.exit(0);

  const counterFile = path.join(dir, `${sessionId}.blocks`);
  const blocks = fs.existsSync(counterFile)
    ? parseInt(fs.readFileSync(counterFile, "utf8"), 10) || 0
    : 0;

  const run = (script) => {
    try {
      execFileSync(process.execPath, [script, "--quiet", ...files], {
        cwd: projectDir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
      });
      return null;
    } catch (err) {
      return `${err.stdout || ""}${err.stderr || ""}`.trim();
    }
  };

  const problems = [
    ["Unsourced claims", run("scripts/check-sources.mjs")],
    ["Style errors", run("scripts/lint-prose.mjs")],
  ].filter(([, out]) => out);

  if (!problems.length) {
    fs.rmSync(counterFile, { force: true });
    process.exit(0);
  }

  if (blocks >= MAX_BLOCKS) {
    process.stderr.write(
      `Chapters edited this session still fail checks after ${blocks} attempts. ` +
      `Letting the turn end so you can look at it yourself: run \`just check\`.\n`);
    fs.rmSync(counterFile, { force: true });
    process.exit(0);
  }

  fs.writeFileSync(counterFile, String(blocks + 1));
  process.stderr.write(
    problems.map(([label, out]) => `${label}:\n\n${out}`).join("\n\n") +
    `\n\nEvery number, date, named attribution, protocol parameter and standards ` +
    `reference in a chapter body must map to an entry in that chapter's frontmatter ` +
    `\`sources:\` list, cited inline as {/* src:<id> */}.\n` +
    `Verify against a primary source with the fact-check-chapter skill. ` +
    `If a claim cannot be verified, flag it in the file with ` +
    `{/* unsourced: <reason> */} and tell the user. Do not delete the claim quietly.\n`);
  process.exit(2);
});
