---
name: fact-check-chapter
description: Verify the factual claims in a course chapter against primary sources, then write the sources list and inline citation markers into the file. Use when the user asks to fact-check, source, cite or verify a chapter, or when the Stop hook reports an unsourced claim.
disable-model-invocation: true
---

# Fact-check a chapter

This skill edits the chapter file. Run it when the user asks, or when the Stop
hook has flagged an unsourced claim.

Reference material:

- `reference/claim-triggers.md` - what counts as a claim needing a source
- `reference/primary-sources.md` - which source is authoritative for what

## Step 1: Find the claims

```bash
just sources app/chapter/chapters/<slug>.mdx
```

The checker lists every paragraph that states a year, a standards reference, a
named attribution, a security level or a scheme parameter without a citation.
Read the chapter as well: the checker is a pattern matcher and will miss a claim
phrased unusually. Its output is a floor, not a ceiling.

Build a numbered list of distinct claims. Merge duplicates. A claim is one
verifiable assertion, not one paragraph.

## Step 2: Verify each claim against a primary source

Dispatch the claims to the `chapter-fact-checker` subagent, in batches of roughly
five, so the reading stays out of this session's context:

> Verify these claims against primary sources. For each, return: verdict
> (confirmed / contradicted / unverifiable), the primary source URL, and the exact
> supporting text. [claims]

**Know what each tool actually gives you.** This matters more than it sounds:

- **WebSearch returns titles and URLs only.** It does not fetch pages. Never
  treat a search snippet as evidence that a document says something.
- **WebFetch runs your extraction prompt through a small model.** What comes back
  is that model's summary of the page, not the page. It is fine for "does this
  paper discuss X" and for locating the right document. It is not evidence of
  exact wording.
- **For exact specification wording, parameter values, or anything you intend to
  quote, fetch the raw page with `curl` via Bash** and read the bytes yourself:

  ```bash
  curl -sL https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf -o /tmp/fips203.pdf
  curl -sL https://www.rfc-editor.org/rfc/rfc9370.txt | sed -n '1,80p'
  ```

  For a PDF, download it and read it with the Read tool, which handles PDFs by
  page range. Do not quote a value you have only seen summarised.

A claim is verified when a primary source states it. A secondary source that
agrees is not verification; it tells you where to look.

## Step 3: Write the results into the file

For each **confirmed** claim:

1. Add the source to the frontmatter `sources:` block if it is not already there:

   ```yaml
   sources:
     - fips203: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
   ```

   Ids are lowercase, short, stable: `fips203`, `regev05`, `rfc9370`,
   `mldsa-spec`. One id per document, reused across claims.

2. Append `{/* src:<id> */}` to the paragraph making the claim. It must be an MDX
   comment; `<!-- -->` breaks the MDX 3 build.

For each **contradicted** claim: fix the prose to match the source, then cite it.
Tell the user in your report exactly what was wrong and what you changed.

For each **unverifiable** claim: leave the prose alone and mark it:

```
{/* unsourced: no primary source found for the 2011 date; secondary sources disagree */}
```

Then raise it in your report. Do not delete the claim, do not soften it into
vagueness, and do not cite a source that does not actually support it. Flagging
it for the user is the correct outcome.

## Step 4: Confirm and report

```bash
just sources app/chapter/chapters/<slug>.mdx
```

Report to the user:

- claims confirmed, with the source id for each,
- claims contradicted, what the source actually says, and what you changed,
- claims left unverifiable and why,
- anything the checker flagged that turned out not to be a claim, for example a
  worked-example number caught by the scheme-parameter pattern.

Keep it to a table or a short list.
