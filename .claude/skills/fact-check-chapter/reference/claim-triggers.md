# What counts as a claim

A claim is an assertion about the world that a reader could check. It needs a
primary source. Maths is not a claim: a derivation is checked by following it, not
by citing it.

## Needs a source

| Category | Examples |
| --- | --- |
| Dates and years | "standardised in 2024", "Regev's 2005 paper" |
| Standards references | FIPS 203, FIPS 204, FIPS 205, RFC 9370, SP 800-56C, ISO/IEC 18033 |
| Named attribution | "Ajtai showed", "introduced by Regev", "Babai's rounding algorithm", "et al." |
| Scheme parameters | "ML-KEM uses q = 3329", "n = 256", "ML-DSA-65 signatures are 3309 bytes" |
| Security levels | "NIST security category 3", "targets 128-bit classical security" |
| Claims about what a standard requires | "the spec mandates rejection sampling", "keys are stored in NTT form" |
| Performance and size figures | key sizes, ciphertext sizes, cycle counts, failure probabilities |
| Claims about the state of the art | "the best known attack costs", "no polynomial-time algorithm is known" |

## Does not need a source

| Category | Examples |
| --- | --- |
| Maths inside a worked example | `$q = 17$`, `$x = (3, 4)$`, `$\|x\| = 5$` |
| Definitions the course itself gives | "a lattice is the set of integer combinations of a basis" |
| Derivations and proofs shown in the text | the Pythagorean length calculation |
| Statements about earlier chapters | "as we saw in chapter 2" |
| Generic engineering observations | "multiplying every pair of coefficients is quadratic work" |

## Borderline, use judgment

- **A parameter used illustratively.** "Take q = 3329 for concreteness" is fine
  unsourced if the chapter is not asserting that this is ML-KEM's modulus. The
  moment the chapter names the scheme, it needs a source.
- **Widely known history.** "RSA dates from the 1970s" is still a date. Cite it;
  it costs one line.
- **Hardness folklore.** "SVP is NP-hard under randomised reductions" is a real
  claim with a real paper behind it. Cite the paper, and be careful about the
  exact statement: the approximation factor matters.

## The checker is a floor, not a ceiling

`scripts/check-sources.mjs` matches patterns: years, standards identifiers, a list
of researcher surnames, scheme names near numbers. It will miss a claim phrased
without any of those, and it will occasionally flag a paragraph that only mentions
a scheme near an unrelated number. Read the chapter yourself as well.
