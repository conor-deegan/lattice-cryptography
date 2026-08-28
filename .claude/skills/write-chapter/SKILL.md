---
name: write-chapter
description: Draft or revise a chapter of the "Lattice Cryptography for Applied Cryptographers" course. Use whenever the user asks to write, draft, expand, fill out, or revise a chapter (typically referenced by slug or chapter number). Automatically loads earlier chapters in the same Part plus all of Part 1 as background context so prior material is not re-taught.
---

# Write a chapter

You are helping the user write one chapter of a web-first course called "Lattice
Cryptography for Applied Cryptographers".

The style guide is not repeated here. It lives in `.claude/rules/` and loads
automatically when you edit a file under `app/chapter/chapters/`:

- `chapter-prose.md` for voice, teaching order, banned phrases, spelling, length
- `chapter-maths.md` for equations, notation and mathematical accuracy
- `chapter-structure.md` for chapter shape, frontmatter, diagrams and sourcing

Read them if you are unsure of a specific rule. This file is the procedure.

## How the user invokes this skill

With a chapter slug (filename without `.mdx`), a chapter number, or a path:

- `/write-chapter linear-independence-span-and-dimension`
- `/write-chapter 4`
- `/write-chapter app/chapter/chapters/determinants-and-volume.mdx`

If the user does not specify, ask which chapter.

## Step 1: Load the target chapter and its context

Before writing anything, do this silently:

1. **Find the target chapter file** in `app/chapter/chapters/`. Read its
   frontmatter to get `title`, `chapter` number, `summary`, and `status`. Read
   any existing body content and any `TODO:` outline notes the user has already
   written. These are the user's intent for the chapter and must shape the draft.

2. **Find which Part the chapter belongs to** by reading `app/chapter/parts.ts`
   and matching the chapter number against the `range` of each part.

3. **Load the prior-chapter context.** Read the frontmatter (title + summary) of:
   - **All chapters in Part 1** (chapters 1 to 7), the universal maths
     foundations every later chapter can assume.
   - **All earlier chapters in the same Part as the target.**
   - **All chapters in earlier Parts that are conceptually adjacent.** Use
     judgment: writing a Part 8 chapter on rings, you should also know what
     Parts 5 and 6 (SIS and LWE) covered.

   When in doubt, read frontmatter, not full bodies. Bodies only when you
   genuinely need to check phrasing or notation conventions.

4. **Note any user-supplied chapter-specific instructions** that came with the
   invocation, for example "focus on the geometric picture" or "skip the volume
   formula". These override the default ladder.

## Step 2: Plan the conceptual ladder (silently)

Before writing prose:

1. Identify what the reader already knows from the chapters you loaded.
2. Identify the genuinely new concepts in this chapter, as opposed to concepts
   that are just being applied in a new setting.
3. Build the smallest conceptual ladder needed: the minimum number of distinct
   sections to teach the topic.
4. For each candidate section, check whether it introduces a new mathematical
   object, operation, distribution, ambiguity, or genuinely new application. If
   not, cut or merge it.
5. Decide which one or two concrete examples will carry the chapter.
6. Sanity check: does the chapter read naturally top to bottom, with each section
   depending on the previous?

Only after this is settled should you start writing.

## Step 3: Write the chapter

Replace the existing body, preserving the frontmatter. Update `status: 'draft'`
to `status: 'published'` only if the user explicitly asks; otherwise leave the
status field alone.

Follow the rules in `.claude/rules/`. The linter runs automatically after every
write and will hand back any violations; fix them in the same turn.

## Step 4: Source every factual claim

Before you finish, go through the draft for years, standards references, named
attributions and scheme parameters. Each one needs an entry in the frontmatter
`sources:` list and an inline `{/* src:<id> */}` marker on its paragraph.

If you are asserting something you have not verified, do not guess a citation.
Either run `/fact-check-chapter` on the file, or mark the claim
`{/* unsourced: <reason> */}` and raise it in your report. A pure maths chapter
with no dates, names or parameters needs no sources at all.

The Stop hook blocks the turn while an edited chapter has an unsourced claim.

## Step 5: Report back

Briefly tell the user:

- which prior chapters you treated as background, so they can sanity check the
  assumptions,
- the conceptual ladder you used, one line per section,
- anything in the user's original TODO outline you intentionally cut or merged,
  and why,
- any claim you marked unsourced.

Keep this report tight, a few lines. The user can read the chapter itself for the
prose.
