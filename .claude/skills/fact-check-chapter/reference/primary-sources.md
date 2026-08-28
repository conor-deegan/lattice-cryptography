# Which source is authoritative

Pre-approved in `.claude/settings.json`, so fetching these does not stall on a
permission prompt.

## Standards

| Subject | Primary source |
| --- | --- |
| ML-KEM | FIPS 203, `https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf` |
| ML-DSA | FIPS 204, `https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.204.pdf` |
| SLH-DSA | FIPS 205, `https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.205.pdf` |
| SHA-3, SHAKE | FIPS 202 |
| NIST PQC process, selection rationale, security categories | `https://csrc.nist.gov/projects/post-quantum-cryptography` and the NISTIR round reports |
| Protocol integration, hybrid key exchange | `https://datatracker.ietf.org/` for drafts, `https://www.rfc-editor.org/rfc/rfcNNNN.txt` for published RFCs |

A draft is not an RFC. If you cite `draft-ietf-...`, say in the prose that it is a
draft, and cite the specific version.

## Research

| Subject | Primary source |
| --- | --- |
| Original papers, hardness reductions, attacks | IACR ePrint, `https://eprint.iacr.org/YYYY/NNN` |
| Anything with a DOI | `https://doi.org/...` |
| Preprints outside IACR | `https://arxiv.org/abs/...` |

ePrint papers get revised. Cite the version you read, and prefer the published
version when one exists.

## Scheme teams

| Subject | Primary source |
| --- | --- |
| Kyber, Dilithium design documents and reference code | `https://pq-crystals.org/` |
| Falcon specification | `https://falcon-sign.info/` |
| NTRU | `https://ntru.org/` |
| Keccak, SHAKE internals | `https://keccak.team/` |

Where a scheme team's document and the NIST standard disagree, the standard wins
for anything about the standardised scheme. Say which one you are describing:
Kyber and ML-KEM are not the same thing, and the course should not blur them.

## Not primary sources

Wikipedia, blog posts, conference talks, vendor documentation, LLM output, and
your own memory. Any of these is fine for finding the right document. None of them
is evidence.
