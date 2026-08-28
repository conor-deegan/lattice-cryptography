#!/usr/bin/env node
// PostToolUse hook for Edit|Write.
//   1. Records edited chapters in .claude/.session-edits/<session_id>.txt for the Stop hook.
//   2. Lints the edited chapter and returns violations to Claude with exit 2,
//      so they get fixed in the same turn rather than noticed later.

import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

let input = "";
process.stdin.on("data", (c) => (input += c));
process.stdin.on("end", () => {
  let payload = {};
  try { payload = JSON.parse(input || "{}"); } catch { process.exit(0); }

  const projectDir = process.env.CLAUDE_PROJECT_DIR || payload.cwd || process.cwd();
  const target = payload?.tool_input?.file_path;
  if (!target) process.exit(0);

  const rel = path.relative(projectDir, path.resolve(projectDir, target));
  const isChapter =
    rel.startsWith(path.join("app", "chapter", "chapters")) && rel.endsWith(".mdx");
  if (!isChapter || !fs.existsSync(path.join(projectDir, rel))) process.exit(0);

  if (payload.session_id) {
    const dir = path.join(projectDir, ".claude", ".session-edits");
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, `${payload.session_id}.txt`), `${rel}\n`);
  }

  try {
    execFileSync(process.execPath, ["scripts/lint-prose.mjs", "--quiet", rel], {
      cwd: projectDir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
    });
    process.exit(0);
  } catch (err) {
    const out = `${err.stdout || ""}${err.stderr || ""}`.trim();
    process.stderr.write(
      `Style check failed for ${rel}. Fix these before moving on:\n\n${out}\n\n` +
      `Rules live in .claude/rules/. Warnings are advisory; errors must be fixed.\n`);
    process.exit(2);
  }
});
