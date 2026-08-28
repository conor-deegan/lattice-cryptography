---
description: Equation formatting, notation conventions and mathematical accuracy for course chapters.
paths:
  - "app/chapter/chapters/**/*.mdx"
---

# Maths and notation

## Writing equations

- Use `$...$` for inline maths.
- Use `$$...$$` for displayed equations.
- Use `\{...\}` for sets in LaTeX, not bare `{...}`.
- Use `\|x\|` for norms in LaTeX.
- Use `\|x\|_\infty` for the infinity norm.
- Use `\leq` instead of `<=` in displayed equations.
- Use `_` notation where appropriate, for example `$x_1$`, not `$x1$`, unless
  writing plain text.

The last four are enforced by the linter and will come back as errors.

## Explaining equations

- Explain each term before or immediately after the equation.
- Explain what the equation is checking, measuring, sampling, or defining.
- Give a toy example with numbers where helpful.
- Do not just restate the equation in words.
- Do not introduce symbols before explaining what they mean.
- Avoid repeating an equation unless the second use adds a new point.
- If the same notation appears with scalars, vectors, and matrices, be clear
  about which object is being sampled.

## Accuracy rules

Be precise about mathematical objects. Make sure every mathematical statement is
true, not just intuitive.

Do not say two things are the same if one is only a representation of the other.
Do not blur "the object" with "a way of writing the object".

Worked examples of the distinction:

- A vector is not literally a point. A vector can be drawn as an arrow from the
  origin, and the endpoint of that arrow is a point. Once an origin is fixed,
  many texts identify vectors with points, but that shortcut should be stated
  clearly.
- A coefficient is one entry of a vector. The largest absolute coefficient across
  the vector is the infinity norm.
- A residue modulo $q$ may be represented in different ways. For example, modulo
  $17$, the signed value $-1$ may be represented as $16$.

If there is a possible ambiguity, explain it directly in one or two sentences.

If a term has both an informal and formal meaning, give both.

Do not imply that two distributions are interchangeable just because they have
similar shapes or output ranges.

## Notation table

- Include only if it genuinely helps the chapter.
- Do not include a notation table by default.
- If included, it should only contain symbols actually used in the chapter.
- Columns are the author's choice. `Symbol | Meaning | Example` is the shape the
  existing chapters use.
