---
description: Conventions for the Next.js site that renders the course.
paths:
  - "app/**/*.ts"
  - "app/**/*.tsx"
  - "components/**/*.tsx"
  - "lib/**/*.ts"
  - "hooks/**/*.ts"
---

# Site code

This is Next.js 16 with React 19. The APIs, conventions and file structure differ
from older versions. Read the relevant guide in `node_modules/next/dist/docs/`
before writing app code, and heed deprecation notices.

Use `pnpm`, never `npm`.

## How chapters are loaded

`app/chapter/utils.ts` reads every `.mdx` file in `app/chapter/chapters/`, splits
the frontmatter with a hand-rolled parser, and returns `{ metadata, slug, content }`.

The parser is deliberately simple and worth understanding before you touch
frontmatter:

- It splits each line on the first `": "`. A line without `": "` becomes a key
  with an empty value.
- It does not understand YAML block lists. A `sources:` list parses into junk keys
  such as `"- fips203"`, which nothing reads. This is harmless, and it is why the
  linter has its own parser in `scripts/lib/mdx.mjs`.
- Only `title`, `publishedAt`, `summary`, `image`, `chapter` and `status` are ever
  read back out.

If you make the parser stricter, update `scripts/lib/mdx.mjs` to match.

`demo.mdx` is a component showcase, filtered out in production builds.
Chapters with `status: 'draft'` are filtered from listings and navigation in
production.

## Parts

`app/chapter/parts.ts` maps inclusive chapter-number ranges to Part titles. Parts
are UI only: not clickable, no pages. The prose linter reads these ranges to check
that every chapter number lands inside a declared Part, so adding a chapter beyond
the current ranges means editing `parts.ts` too.

## MDX components

`app/components/mdx.tsx` fixes what MDX can use: `h1` to `h6` (auto-linked
headings), `a`, `code`, `pre`, `Image`, `Table`, `Lattice`. Adding a component
that chapters can call means registering it there.

Maths is rendered with `remark-math` and `rehype-katex`, so chapter LaTeX has to
be KaTeX-compatible, not full LaTeX.
