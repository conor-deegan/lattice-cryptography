@AGENTS.md

# Lattice Cryptography for Applied Cryptographers

A web-first course teaching the maths behind lattice cryptography. Next.js site,
chapters written as MDX.

## Who the reader is

An applied cryptographer, protocol engineer, software engineer or security
engineer. Comfortable with code, APIs, protocols and basic cryptographic ideas.
Not necessarily comfortable with mathematical notation.

The goal is to teach the maths from first principles, accurately, without hiding
complexity. A chapter should read like a careful engineer explaining maths to
another engineer, not like an academic textbook.

## Where things live

| Path | What it is |
| --- | --- |
| `app/chapter/chapters/*.mdx` | The chapters. Filename is the URL slug. |
| `app/chapter/parts.ts` | Part titles and their inclusive chapter-number ranges. |
| `app/chapter/utils.ts` | Frontmatter parser and chapter loader. |
| `app/components/lattice.tsx` | The `<Lattice>` diagram component. |
| `app/components/mdx.tsx` | Which components MDX can use. |
| `scripts/lint-prose.mjs` | Style linter. Runs automatically after every edit. |
| `scripts/check-sources.mjs` | Unsourced-claim checker. Runs before a turn ends. |
| `scripts/lib/rules.mjs` | Banned phrases and spelling lists the linter uses. |
| `.claude/rules/` | The full style guide, loaded per file path. |
| `.claude/skills/` | Procedures: write, refine, fact-check a chapter. |

Course state: 48 chapters across 12 Parts. Chapters 1 to 7 published, 8 and 9
drafted, the rest are one-paragraph stubs waiting to be written.

## Commands

```bash
just check        # lint prose, check sources, typecheck, eslint
just lint         # prose linter across every chapter
just lint FILE    # prose linter on one chapter
just sources      # unsourced-claim check across every written chapter
just dev          # next dev
just build        # next build
```

Use `pnpm`, never `npm`.

## Rules that apply everywhere

These are enforced by `scripts/lint-prose.mjs` and will come back as errors after
any edit. The full guide is in `.claude/rules/`.

- **British English only.** "colour", "behaviour", "centre", "analyse",
  "generalise", "maths". Not "color", "behavior", "center", "analyze".
- **No em dashes.** Use a comma, semicolon, colon, spaced hyphen or full stop,
  whichever fits.
- **Straight quotes only.** No curly quotes anywhere, frontmatter included.
- **Never use these phrases:** "this is important because", "the key insight is",
  "one might ask", "in essence", "mathematically speaking", "at a high level",
  "shape of", "load-bearing".
- **Maths notation:** `$...$` inline, `$$...$$` displayed, `\{...\}` for sets,
  `\|x\|` for norms, `\|x\|_\infty` for the infinity norm, `\leq` not `<=`,
  `$x_1$` not `$x1$`.
- **Headings:** the title comes from frontmatter, so body headings start at `##`.
  Sentence case. No level skips.
- **Sentence limit 32 words, paragraph limit 90 words.** Warnings, not errors.

## Frontmatter contract

```yaml
---
title: 'Vectors, length, and bounds'
publishedAt: '2026-05-14'
summary: 'Vectors, norms, and what cryptographers mean by short.'
chapter: '2'
status: 'draft'
sources:
  - fips203: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
---
```

`title`, `publishedAt`, `summary`, `chapter` and `status` are required. `chapter`
is a quoted whole number, unique, inside a range declared in `parts.ts`.
`status` is `'draft'` or `'published'`. Drafts are hidden in production.

## Sourcing factual claims

Every year, standards reference, named attribution and scheme parameter in a
chapter body must trace to a primary source.

1. List the source in frontmatter under `sources:` as `  - <id>: <url>`.
2. End the paragraph that makes the claim with `{/* src:<id> */}`.

It must be an MDX comment. `<!-- -->` breaks the MDX 3 build.

Maths with numbers in it is not a claim. `$q = 3329$` in a worked example needs
no source; "ML-KEM uses q = 3329" does.

If a claim cannot be verified against a primary source, mark it
`{/* unsourced: <reason> */}` and tell the user. Never quietly delete or soften
a claim to get a check to pass.

## Skills

- `/write-chapter <slug>` draft or revise a chapter.
- `/refine-chapter <slug>` improve an existing chapter, strictly-better edits only.
- `/fact-check-chapter <slug>` verify claims against primary sources.

## Working on the site itself

This is Next.js 16. Read the guide in `node_modules/next/dist/docs/` before
writing app code; the APIs differ from older versions.
