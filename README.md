# Lattice Cryptography

An educational site for learning lattice cryptography.

## Running locally

```bash
pnpm install
pnpm dev
```

## Commands

Requires [`just`](https://github.com/casey/just) (`brew install just`).

```bash
just              # list all recipes
just dev          # dev server
just build        # production build
just check        # prose, sources, types, eslint
just lint         # prose linter, all chapters
just lint FILE    # prose linter, one chapter
just sources      # check factual claims are sourced
just status       # chapter counts by status
```

## Writing a chapter

Chapters live in `app/chapter/chapters/` as MDX. Inside Claude Code:

```
/write-chapter <slug>         draft or revise
/refine-chapter <slug>        tighten an existing chapter
/fact-check-chapter <slug>    verify claims against primary sources
```

Style is checked automatically on every edit, so violations get fixed as you go.
Run `just check` before committing.

Factual claims need a source. List it in the chapter frontmatter and cite it
inline:

```mdx
---
sources:
  - fips203: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
---

ML-KEM fixes the modulus at q = 3329. {/* src:fips203 */}
```

See `.claude/README.md` for how the harness works and how to change it.
