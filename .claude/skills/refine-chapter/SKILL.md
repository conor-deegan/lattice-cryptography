---
name: refine-chapter
description: Review and refine an existing chapter of the "Lattice Cryptography for Applied Cryptographers" course. Use when the user asks to refine, improve, polish, tighten, or critique a chapter. Makes only edits that are strictly better - easier to understand, simpler, more accurate, less padded, fewer gaps, smoother continuity with prior chapters. Reports each edit and the reason for it.
---

# Refine a chapter

You are reviewing one chapter of "Lattice Cryptography for Applied Cryptographers"
and editing it to be strictly better.

The style guide lives in `.claude/rules/` and loads automatically when you edit a
chapter. Use `chapter-prose.md`, `chapter-maths.md` and `chapter-structure.md` as
the standard you are judging against. This file is the procedure.

"Strictly better" means an edit must win on at least one of these axes without
losing on the others:

- easier to understand
- simpler
- more accurate
- less padded
- fewer gaps (missing step in an argument, undefined notation, dropped term)
- smoother continuity with earlier chapters (less re-teaching, no assumed-but-untaught concepts)
- better example choice
- sharper opening or sharper section purpose

If an edit makes the prose shorter but harder to follow, or clearer but less
precise, do not make it. When in doubt, leave the original alone. First, do no harm.

## How the user invokes this skill

By slug, chapter number, or path:

- `/refine-chapter linear-independence-span-and-dimension`
- `/refine-chapter 4`
- `/refine-chapter app/chapter/chapters/determinants-and-volume.mdx`

If the user does not specify a chapter, ask which one. If the user also gives a
specific focus ("tighten the opening", "the worked example feels off"), prioritize
that over the default diagnostic sweep.

## Step 1: Load the chapter and its context

Same loading procedure as the `write-chapter` skill:

1. Read the target chapter's full body and frontmatter from `app/chapter/chapters/`.
2. Read `app/chapter/parts.ts` to find which Part the chapter belongs to.
3. Read the frontmatter (title + summary) of all chapters in Part 1, all earlier
   chapters in the same Part, and conceptually adjacent chapters in earlier Parts.

   Frontmatter only. Open earlier chapter bodies only if you need to verify a
   phrasing or notation convention before making an edit.

The point of loading prior context is to catch continuity issues: re-teaching,
missing reminders, mismatched notation, terminology that drifts between chapters.

## Step 2: Run the mechanical checks first

```bash
just lint app/chapter/chapters/<slug>.mdx
just sources app/chapter/chapters/<slug>.mdx
```

Anything the linter catches is not worth your reading time. Fix those, then spend
your attention on what a linter cannot see.

## Step 3: Diagnostic pass

Read the chapter carefully and produce a private diagnostic list. Score each
finding by which "strictly better" axis it improves. Group findings into:

- **Continuity** - does this chapter re-teach something already taught? Does it
  assume something that has not been taught yet? Does notation match earlier chapters?
- **Opening** - does the first paragraph or two establish the practical question
  this chapter answers? Or does it preamble?
- **Section purpose** - does each section have a distinct job (new object, new
  operation, new distribution, new ambiguity, new application)? Are there two
  sections doing similar work that should merge?
- **Notation** - is every symbol introduced before use? Is every equation followed
  by an explanation of its terms?
- **Examples** - is there one strong worked example, or multiple that do the same
  job? Does the worked example consolidate (good) or introduce new concepts (bad)?
  Are the numbers small and concrete?
- **Accuracy** - does the chapter conflate an object with a representation? Does
  it use "same as" where "analogous to" would be more honest? Are residue
  representations handled clearly? Is every mathematical statement strictly true,
  not just intuitive?
- **Density** - is there a paragraph that could be cut without loss? A "why this
  matters" repeated across sections? Motivational filler?
- **Closing sections** - is "What to remember" present and compact? Does it
  introduce new ideas (bad)? Are common mistakes genuinely useful, or padding?
  Are checkpoint questions earning their place?
- **Gaps** - any step in a worked example skipped? Any equation whose terms are
  not explained? Any concept introduced but never connected to lattice
  cryptography downstream?

If the chapter is already strong on an axis, say so in the report and skip it.
Not every chapter needs every kind of edit.

## Step 4: Decide edit scope

Pick the smallest edit that achieves each improvement.

- A typo or banned phrase is a single Edit call.
- A paragraph that can be cut is a single Edit call replacing it with nothing, or
  with one tighter sentence.
- A section reorder is a single larger Edit.
- A full section rewrite is only justified if that section was failing on multiple
  axes, for example wrong scope and re-teaching and padded.

Avoid rewriting prose that is already working. Prefer Edit over Write. Use Write
only if you are restructuring most of the chapter and the user has signed off on
that scope.

Preserve the frontmatter exactly. Do not change `status`, `title`, `chapter`, or
`publishedAt` unless the user asks.

## Step 5: Make the edits

Use the Edit tool for each change. Keep changes minimal and targeted. Maintain the
chapter's existing voice: your job is to refine, not to rewrite in your own style.

If you find an issue that you are not sure how to fix without risking a loss on
another axis, do not edit it. Note it in the report instead and ask the user.

If you add or sharpen a factual claim, it needs a source. See the sourcing section
of `.claude/rules/chapter-structure.md`, or run `/fact-check-chapter`.

## Step 6: Report back

```
## Edits made
- [section or line reference]: [what changed] - [which axis it improves]
- ...

## Flagged but not edited
- [issue]: [why I left it alone or what I would need from you]

## Already strong
- [one line on what the chapter is doing well, so the user knows what not to lose]
```

Keep this report under about 250 words. The user can read the diff for the prose
itself.

If you made no edits because the chapter is already strong, say that directly and
give your one-paragraph reasoning.

## Things this skill should not do

- Do not change the chapter's scope or topic. If the chapter is teaching the wrong
  thing, flag it for the user instead of rewriting it.
- Do not add new sections unless the diagnostic clearly shows a gap that hurts
  comprehension.
- Do not delete a worked example just because it could be shorter. Worked examples
  earn their place if they consolidate.
- Do not "improve" prose that is already direct and accurate. Style preferences
  are not improvements.
- Do not change notation conventions globally. If the chapter uses one convention
  and an earlier chapter uses another, flag it, do not unilaterally rewrite either.
- Do not touch the frontmatter unless explicitly asked.
