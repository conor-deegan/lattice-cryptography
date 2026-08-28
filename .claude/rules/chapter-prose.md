---
description: Voice, tone, teaching order and prose style for course chapters.
paths:
  - "app/chapter/chapters/**/*.mdx"
---

# Chapter prose

## Audience and tone

The audience is technical, but not maths-heavy. Assume the reader is an applied
cryptographer, protocol engineer, software engineer, or security engineer. They
are comfortable with code, APIs, protocols, and basic cryptographic ideas, but
they may not be comfortable with mathematical notation.

The goal is to teach the maths needed for lattice cryptography from first
principles, accurately and without hiding complexity.

Write in a plain, direct, technical style. The chapter should feel like a careful
engineer explaining maths to another engineer.

- Plain but not dry.
- Direct but not abrupt.
- Technical but not academic.
- Explanatory, not performative.
- Assume the reader is smart and practical.
- Do not patronize the reader by over-explaining obvious programming concepts.
- Do not rely on "trust me, this matters later". Give the reason in concrete terms.
- Do not oversell the concept. If something is simple, let it be simple.

Do not write like an academic textbook. Do not use hype. Do not use rhetorical
filler. Do not use forced analogies. Do not over-explain simple things. Do not
skip necessary steps. Do not assume the reader is fluent in notation. Do not blur
mathematical distinctions for simplicity; if a common shortcut is being used, name
it clearly. Do not make a familiar idea sound more mysterious than it is. Do not
introduce formal terminology before the reader understands what problem it solves.
Do not repeat the same explanation in multiple sections unless the repetition adds
something genuinely new.

## Core teaching principle

- Start from the intuition the reader probably already has.
- Say what problem or question we are trying to answer.
- Then introduce the formal term or notation as the name for that idea.
- Do not present notation or terminology as a new concept if it is just
  formalizing an existing intuition.
- The reader should always know why the next concept is being introduced.

## For each major new concept

Use as a guide, not a rigid template. Do not force all eight steps into every
section if doing so creates repetition.

1. Start with the plain English idea.
2. Explain what question or problem motivates it.
3. Give a small concrete example.
4. Introduce the formal term or notation.
5. Explain how to read the notation.
6. Explain what the notation is doing.
7. Explain why the concept is needed later for lattice cryptography.
8. Give one common mistake or point of confusion only if it is genuinely useful.

Do not repeat the same motivation for every related concept. If a new concept is
only a small extension of the previous one, explain the difference directly and
move on.

## Style rules

- Use simple language.
- Use short paragraphs but DO NOT use one sentence per line.
- Build the idea step by step.
- Keep the flow linear. Each section should depend on the previous section.
- Use one strong example instead of several similar examples.
- Prefer concrete examples with small numbers.
- Introduce notation only when needed.
- Immediately explain how to read notation if it may be unfamiliar.
- Use "You can read this as..." only when it genuinely helps. Do not overuse it
  for notation the reader already understands.
- Avoid jargon where possible. If jargon is needed, define it once.
- Prefer precise words over loose simplifications.
- Keep the writing compact.
- If a concept has already been explained, refer back to it rather than explaining
  it again from scratch.
- Do not include motivational filler. Give the concrete reason the concept is useful.

## Banned phrases

Enforced by the linter. Never write:

- "this is important because"
- "the key insight is"
- "one might ask"
- "in essence"
- "mathematically speaking"
- "at a high level"
- "shape of"
- "load-bearing"

## Spelling and typography

Enforced by the linter.

- British English only: "colour", "behaviour", "centre", "analyse", "generalise",
  "labelled", "modelling", "maths". Never the American form.
- Do not use em dashes. Replace with whatever actually fits: a comma, a
  semicolon, a colon, a spaced hyphen, or a full stop.
- Use straight quotes only, in the body and in the frontmatter. If a frontmatter
  value needs an apostrophe, quote the YAML value with double quotes.

## Length and density

- Sentences stay under 32 words. Paragraphs stay under 90 words. The linter warns
  above those limits. The "By the end of this chapter..." sentence is exempt.
- Prefer concise explanations over exhaustive ones.
- Use one strong example instead of three similar examples.
- Keep sections short enough for a web page reader.
- If a paragraph can be cut without losing understanding, cut it.
- The final chapter should feel complete, but not padded.
- Aim for clarity by structure, not by repeating the same point many times.
- A short accurate section is better than a long section that over-explains.

## Course continuity

This is part of a course, not a standalone article. The reader has already
learned earlier concepts.

Do not re-teach earlier material unless this chapter genuinely depends on a
subtle distinction. Prefer a one-sentence reminder:

> "Using the vector notation from chapter 2..."

Distinguish clearly between a genuinely new concept, a brief reminder of an
earlier concept, and an application of an earlier concept in a new setting. Only
genuinely new concepts deserve full teaching sections.

- If vectors were already covered, do not explain what a vector is again.
- If norms were already covered, do not include a full norm section unless the
  chapter is about norms.
- If modular arithmetic was already covered, do not re-teach wraparound. Only
  mention the specific issue needed for the current chapter.
- If matrices were already covered, do not explain matrix-vector multiplication
  again.

Bad pattern:

> "Here is another full section explaining what short vectors are."

Better pattern:

> "Using the earlier idea of coefficient size, a small random vector is sampled
> by choosing each coefficient from a small distribution."
