---
name: write-next-chapter
description: Work out which chapter of the "Lattice Cryptography for Applied Cryptographers" course is next to work on, the lowest-numbered one that is not published, then draft or revise it. Use when the user asks for the next chapter or says to carry on with the course without naming one.
disable-model-invocation: true
---

# Write the next chapter

Same job as `write-chapter`, except the user has not named a target. Work out
which chapter is next, confirm it, then write it.

This skill drafts a whole chapter. It is invoked deliberately, never picked up on
your own initiative.

## Step 1: Resolve the target

```bash
just next
```

That prints the lowest-numbered chapter whose `status` is not `'published'`, as
`number, slug, state, title, part`, plus a progress line. Do not work this out by
reading the directory yourself; the command already accounts for gaps and for the
demo page.

A chapter is outstanding until it is published, so `state` tells you which job
this is:

- `stub` - a placeholder paragraph or a TODO outline. Write it from scratch.
- `drafted` - real prose that is not published yet. This is a revision. Read what
  is there first, and treat the existing draft as the user's intent rather than
  something to replace wholesale. If it only needs tightening rather than
  rewriting, say so and suggest `/refine-chapter` instead.

`just next 5` lists the next five, if you need to see what is coming.

If it reports that nothing is outstanding, say so and stop. Do not invent a chapter.

## Step 2: Check it is really the right one

The lowest-numbered stub is usually right, but not always. Say which chapter you
are about to write in one line, and pause for the user if any of these hold:

- **The user gave a hint** in their invocation ("do the next one in Part 6",
  "skip ahead to the NTT chapter"). Follow the hint over the default.
- **The next chapter sits in a Part whose earlier chapters are also unpublished**,
  so the ladder into it may not be settled yet. Name the gap and ask whether to
  work on the earlier one first.
- **The chapter depends on a Part that has not been written**, for example an
  ML-KEM chapter while the Ring-LWE chapters are still stubs. Writing it means
  either re-teaching later or assuming untaught material. Flag it.

Otherwise say which chapter you are writing and get on with it. Do not ask
permission for the ordinary case; the user invoked this to avoid picking.

## Step 3: Write it

Follow `.claude/skills/write-chapter/SKILL.md` from its Step 1 onwards, with the
chapter you just resolved as the target. Everything there applies unchanged:
loading prior-chapter context, planning the conceptual ladder, the style rules in
`.claude/rules/`, sourcing every factual claim.

## Step 4: Report back

The write-chapter report, plus one extra line:

```bash
just next
```

Tell the user what is next after this one, so they can decide whether to keep
going.
