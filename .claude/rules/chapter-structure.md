---
description: Chapter shape, section discipline, diagrams and the frontmatter and sourcing contract.
paths:
  - "app/chapter/chapters/**/*.mdx"
---

# Chapter structure

Use Markdown. Treat the structure below as a guide, not a rigid template.

## Frontmatter

```yaml
---
title: 'Vectors, length, and bounds'
publishedAt: '2026-05-14'
summary: 'Vectors, norms, and what cryptographers mean by short.'
chapter: '2'
status: 'draft'
sources:
  - fips203: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
  - regev05: https://cims.nyu.edu/~regev/papers/qcrypto.pdf
---
```

`title`, `publishedAt`, `summary`, `chapter`, `status` are required. `chapter` is
a quoted whole number, unique across the course, inside a range declared in
`app/chapter/parts.ts`. `status` is `'draft'` or `'published'`; drafts are hidden
in production.

Do not change `status`, `title`, `chapter` or `publishedAt` unless the user asks.

Straight quotes only. If a value contains an apostrophe, wrap the value in double
quotes rather than reaching for a curly apostrophe.

## Sourcing

Every year, standards reference, named attribution and scheme parameter in the
body must map to an entry in `sources:`.

1. Add `  - <id>: <url>` under `sources:`.
2. End the paragraph making the claim with `{/* src:<id> */}`.

Use an MDX comment. `<!-- -->` is not valid MDX 3 and breaks the build.

Maths with numbers in it is not a claim. `$q = 3329$` inside a worked example
needs no source. "ML-KEM uses q = 3329" does.

A claim you cannot verify against a primary source gets
`{/* unsourced: <reason> */}` and a note to the user. Never soften or delete a
claim just to make the checker pass.

## Headings

The page renders `title` from the frontmatter, so the body starts at `##`. Never
write a `#` heading in the body. Sentence case. No level skips.

## Opening

Start directly with the concept. Explain the practical question the chapter
answers. Do not include a long preamble. Do not list too many goals up front,
only what helps the reader understand the chapter's direction.

The house pattern is two or three short paragraphs followed by a "By the end of
this chapter, you should understand..." sentence. Keep it unless the user asks
otherwise.

## Main sections

- Build from concrete examples to notation.
- Keep the flow linear.
- Avoid multiple sections that explain the same idea in slightly different words.
- If two sections are doing the same job, merge them.
- Once a concept has been taught, use it rather than re-teaching it.
- Avoid repeating the same "why this matters" paragraph across sections.
- Do not create a separate section for a one-sentence idea.

## Diagrams

Two options, and they are not interchangeable.

Use the `<Lattice>` component when the picture is a 2D lattice, basis or vector
that the component can actually draw:

```jsx
<Lattice
  basis={[[1, 0], [0, 1]]}
  vectors={[{ v: [3, 4], label: "x", color: "#dc2626" }]}
  caption="The vector (3, 4), drawn as an arrow from the origin to (3, 4)"
/>
```

Props: `basis` (required), `vectors`, `range`, `size`, `showBasis`,
`showFundamentalDomain`, `tileFundamentalDomain`, `showAxes`, `showStats`,
`basisLabels`, `caption`.

Use a placeholder when the diagram is something the component cannot draw:

```
[Diagram: describe what should be drawn]
```

A placeholder is a TODO. The linter rejects one in a `published` chapter, so
either build the real diagram or leave the chapter as a draft.

If a diagram involves vectors, describe them accurately as arrows, displacements,
endpoints, or lattice points as appropriate.

## Worked examples

- Include worked examples only if they consolidate ideas already taught.
- Do not include worked examples just to satisfy a template.
- Do not introduce major new concepts inside worked examples.
- Prefer one strong worked example over several repetitive examples.

## Common mistakes

- Include this section only if there are genuinely useful mistakes to flag.
- Keep each mistake brief.
- Avoid repeating a full explanation from earlier sections.

## What to remember

Always include this section. Published chapters fail the linter without it.

Give a short list of the core ideas. Keep it compact. Do not introduce new ideas
here. Avoid repeating every detail from the chapter.

## Checkpoint questions

Include only if useful for the chapter. Give 5 to 8 questions that test
understanding, not memorization. Do not include questions if they make the
chapter feel padded.
