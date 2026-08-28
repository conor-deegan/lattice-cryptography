# The harness

How this repo tells Claude what to do, and what it enforces rather than asks for.

## Layout

```
CLAUDE.md                     always loaded: audience, always-on rules, commands, layout
AGENTS.md                     Next.js version warning, imported by CLAUDE.md

.claude/
  settings.json               hooks and pre-approved permissions (version controlled)
  settings.local.json         your personal permission grants (gitignored)
  rules/                      the style guide, loaded by file path
    chapter-prose.md            voice, teaching order, banned phrases, spelling, length
    chapter-maths.md            equations, notation, mathematical accuracy
    chapter-structure.md        chapter shape, frontmatter, diagrams, sourcing
    site-code.md                Next.js app conventions
  skills/                     procedures, invoked with /<name>
    write-chapter/              draft or revise a chapter
    refine-chapter/             strictly-better edits to an existing chapter
    fact-check-chapter/         verify claims against primary sources, then cite them
  agents/
    chapter-fact-checker.md     reads sources, returns a verdict table, not page dumps

scripts/
  lint-prose.mjs              style linter
  check-sources.mjs           unsourced-claim checker
  lib/mdx.mjs                 frontmatter parsing and maths/code masking
  lib/rules.mjs               banned phrases, spelling lists, name lists
  hooks/
    protect-paths.mjs         PreToolUse: refuses edits to protected files
    post-edit.mjs             PostToolUse: lints the edited chapter, records it
    stop-check.mjs            Stop: blocks the turn on unsourced claims
```

## What governs what

| Question | File |
| --- | --- |
| Who is the reader, what are the always-on rules? | `CLAUDE.md` |
| How should chapter prose read? | `.claude/rules/chapter-prose.md` |
| How is an equation written and explained? | `.claude/rules/chapter-maths.md` |
| What sections does a chapter have? | `.claude/rules/chapter-structure.md` |
| How does the site load chapters? | `.claude/rules/site-code.md` |
| What are the steps to write a chapter? | `.claude/skills/write-chapter/SKILL.md` |
| Which words are banned? | `scripts/lib/rules.mjs` (and mirrored in the prose rule) |
| What counts as a claim needing a source? | `.claude/skills/fact-check-chapter/reference/claim-triggers.md` |
| Which source is authoritative? | `.claude/skills/fact-check-chapter/reference/primary-sources.md` |

Rules load by path. Editing `app/chapter/chapters/*.mdx` pulls in the three
chapter rules; editing `app/**/*.tsx` pulls in `site-code.md`. Nothing else loads,
which is why the rule files can be long.

## Adding to it

**A new style rule.** Put the prose in the matching `.claude/rules/*.md`. If it is
mechanically checkable, also add it to `scripts/lint-prose.mjs` so it fails rather
than relying on being read. Word lists go in `scripts/lib/rules.mjs`; keep the
list and the rule file in step. A rule that only exists in a `.md` file is
advisory.

**A new procedure.** "When doing X, do A then B then C" is a skill, not a rule.
Create `.claude/skills/<name>/SKILL.md` with `name` and `description` frontmatter.
Keep it under 500 lines and move long reference material into sibling files the
SKILL.md points at. Set `disable-model-invocation: true` if it has side effects,
so it only runs when you ask for it.

**A new check.** Add it to `scripts/lint-prose.mjs` as an error or a warning. Both
hooks pick it up with no further wiring. Errors block; warnings inform.

**A new protected file.** Add a pattern to `PROTECTED` in
`scripts/hooks/protect-paths.mjs`.

**A new research domain.** Add `WebFetch(domain:...)` and the matching
`Bash(curl ...)` entries to `.claude/settings.json`, and list the source in
`primary-sources.md` so the fact-checker knows what it is good for.

## The hooks

| Hook | Trigger | Effect |
| --- | --- | --- |
| PreToolUse | `Edit`, `Write`, `NotebookEdit` | Blocks edits to lockfiles, `LICENSE`, build output, `settings.local.json` |
| PostToolUse | `Edit`, `Write` on a chapter | Lints the file; errors come straight back to Claude to fix in the same turn. Records the path for the Stop hook |
| Stop | end of turn | Re-checks chapters edited this session for unsourced claims and style errors; blocks the turn if any remain |

The Stop hook only looks at chapters edited in the current session. Chapters that
predate the sourcing convention are left alone, so the harness does not deadlock
on 40 files of history. It gives up after three blocks so a genuinely stuck turn
can still end.

Session bookkeeping lives in `.claude/.session-edits/` and is gitignored. Clear it
with `just clean-session`.

## Where the style guide comes from

`.claude/rules/` is the style guide. There is no document behind it: the original
freeform style notes were folded into these files and the linter, then deleted.
Change a rule here and in `scripts/lint-prose.mjs`, not anywhere else.

## Running the checks by hand

```bash
just check                                        # everything
just lint                                         # prose, all chapters
just lint app/chapter/chapters/what-is-a-lattice.mdx
just lint-strict                                  # warnings fail too
just sources                                      # unsourced claims
just status                                       # how much of the course exists
```
