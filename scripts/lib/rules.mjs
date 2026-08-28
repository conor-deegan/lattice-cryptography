// Word and phrase lists used by the prose linter.
// Edit these lists to change what the linter enforces; edit .claude/rules/*.md to
// change what Claude is told. Keep the two in step.

// Exact wording. The last two ("shape of", "load-bearing") were added on top of
// the original style notes by explicit decision.
export const BANNED_PHRASES = [
  "this is important because",
  "the key insight is",
  "one might ask",
  "in essence",
  "mathematically speaking",
  "at a high level",
  "shape of",
  "load-bearing",
];

// Narrative signposting: promises that something will matter later, and prose
// that narrates the course's own structure. The chapter should state the point
// and move on, so these are errors, matched case-insensitively on the masked
// body. Present-tense claims about the material at hand are fine and must stay
// legal: "order matters" and "the choice is important" are not foreshadowing.
// Each entry is [pattern, hint]; the hint is shown to whoever tripped it.
export const FORESHADOWING_PATTERNS = [
  [/\bthe rest of (?:the|this) (?:course|book|series|chapter|part)\b/gi,
    "do not describe what the rest of the course does"],
  [/\bthe remainder of (?:the|this) (?:course|book|series|chapter|part)\b/gi,
    "do not describe what the remainder of the course does"],
  [/\beverything (?:that )?(?:follows|comes later|comes after)\b/gi,
    "do not describe what the later material does"],
  [/\b(?:what|which) (?:we|you) (?:need|want|do|cover) next\b/gi,
    "do not announce what comes next; just write it"],
  [/\bwhat comes next\b/gi, "do not announce what comes next; just write it"],
  [/\bnext up\b/gi, "do not announce what comes next; just write it"],
  [/\bmore on (?:this|that|it) later\b/gi, "either explain it here or leave it out"],
  [/\b(?:will|is going to|are going to) matter\b/gi,
    "do not promise that something will matter later"],
  [/\bmatters? (?:a lot |even more )?later\b/gi,
    "do not promise that something will matter later"],
  [/\b(?:will be|becomes?|is going to be|turns out to be) (?:important|useful|essential|crucial|central|relevant|significant)\b/gi,
    "do not promise future importance; give the reason now or cut it"],
  [/\bas (?:we|you)(?:'ll| will) see\b/gi, "state the point where it belongs instead"],
  [/\blater (?:we|you)(?:'ll| will)\b/gi, "state the point where it belongs instead"],
  [/\b(?:we|you)(?:'ll| will) (?:see|meet|need|use|revisit|return to|come back to)\b[^.!?]{0,30}\blater\b/gi,
    "state the point where it belongs instead"],
  [/\b(?:we|you)(?:'ll| will) (?:come back to|return to|revisit)\b/gi,
    "state the point where it belongs instead"],
  [/\b(?:which|that) (?:we|you)(?:'ll| will) need\b/gi,
    "do not flag material as needed later"],
  [/\b(?:will come|comes) (?:up|back) (?:again|later)\b/gi,
    "do not flag material as returning later"],
  [/\b(?:keep|bear) (?:this|that|it) in mind\b/gi, "state the point and move on"],
  [/\bstay tuned\b/gi, "state the point and move on"],
  [/\b(?:when|before) (?:we|you) (?:get|come) to\b/gi,
    "do not narrate the reading order of the course"],
  [/\bsets? (?:up )?the stage\b/gi, "do not narrate the structure of the course"],
  [/\blays? the groundwork\b/gi, "do not narrate the structure of the course"],
];

// Softer forward references. A pointer to where something is covered properly
// is occasionally the honest thing to write, so these warn rather than fail.
export const FORWARD_REFERENCE_PATTERNS = [
  [/\b(?:later|future|upcoming|subsequent|following) (?:chapters?|parts?|sections?)\b/gi,
    "forward reference; prefer stating the point and moving on"],
  [/\b(?:a|the) (?:next|later|following) (?:chapter|part|section)\b/gi,
    "forward reference; prefer stating the point and moving on"],
  [/\bbuilding (?:toward|towards|up to)\b/gi,
    "narrating the chapter's own structure; prefer stating the point"],
  [/\bthis chapter (?:will|is going to) \b/gi,
    "narrating the chapter's own structure; prefer stating the point"],
];

// American spellings that must be British. Left side is matched case-insensitively
// on whole words; the suggestion preserves the original capitalisation.
export const AMERICAN_SPELLINGS = {
  color: "colour",
  colors: "colours",
  colored: "coloured",
  behavior: "behaviour",
  behaviors: "behaviours",
  neighbor: "neighbour",
  neighbors: "neighbours",
  neighboring: "neighbouring",
  center: "centre",
  centers: "centres",
  centered: "centred",
  fiber: "fibre",
  fibers: "fibres",
  defense: "defence",
  offense: "offence",
  catalog: "catalogue",
  gray: "grey",
  favorite: "favourite",
  labeled: "labelled",
  labeling: "labelling",
  modeling: "modelling",
  canceled: "cancelled",
  traveling: "travelling",
  math: "maths",
  program: "programme",
  practicing: "practising",
  skeptical: "sceptical",
  skepticism: "scepticism",
};

// Words ending -ize/-ise etc. that are correct in British English and must not
// be rewritten. Everything else matching the -ize/-yze pattern is flagged.
// Guard against a global find-and-replace rewriting a key into its own value,
// which would make the linter flag the correct British spelling and suggest itself.
for (const [american, british] of Object.entries(AMERICAN_SPELLINGS)) {
  if (american === british) {
    throw new Error(
      `scripts/lib/rules.mjs: "${american}" maps to itself in AMERICAN_SPELLINGS. ` +
      `A find-and-replace has probably rewritten the key as well as the value.`,
    );
  }
}

export const IZE_SAFELIST = new Set([
  "size", "sizes", "sized", "sizing",
  "resize", "resizes", "resized", "resizing",
  "oversize", "oversized", "downsize", "downsized", "midsize",
  "capsize", "capsized",
  "prize", "prizes", "prized",
  "seize", "seizes", "seized", "seizing",
  "maize", "assize", "wize",
]);

export const IZE_PATTERN = /\b[A-Za-z]+(?:iz(?:e|es|ed|ing|ation|ations|er|ers)|yz(?:e|es|ed|ing))\b/g;

// Capitalised tokens allowed to appear mid-heading without breaking sentence case.
export const PROPER_NOUNS = new Set([
  "Gaussian", "Fourier", "Pythagorean", "Euclidean", "Gram", "Schmidt",
  "Hermite", "Minkowski", "Babai", "Regev", "Ajtai", "Micciancio", "Peikert",
  "Lyubashevsky", "Gentry", "Shor", "Grover", "Lenstra", "Schnorr", "Kannan",
  "Hoffstein", "Pipher", "Silverman", "Coppersmith", "Falcon", "Kyber",
  "Dilithium", "Frodo", "Saber", "Part", "Read", "English", "Markdown",
  "Python", "Rust", "Go", "January", "February", "March", "April", "May",
  "June", "July", "August", "September", "October", "November", "December",
]);

// Names that, used as an attribution, need a source behind them.
export const ATTRIBUTED_NAMES = [
  "Regev", "Ajtai", "Micciancio", "Peikert", "Lyubashevsky", "Gentry",
  "Shor", "Grover", "Babai", "Lenstra", "Schnorr", "Hoffstein", "Pipher",
  "Silverman", "Coppersmith", "Kannan", "Banaszczyk", "Dwork", "Alkim",
  "Ducas", "Prest", "Fouque", "Stehle", "Bos", "Schwabe",
];

export const SCHEME_NAMES = [
  "ML-KEM", "ML-DSA", "SLH-DSA", "Kyber", "Dilithium", "Falcon", "NTRU",
  "NTRUEncrypt", "Frodo", "FrodoKEM", "Saber", "NewHope", "BIKE", "HQC",
  "Classic McEliece", "X25519", "RSA", "ECDSA", "Ed25519",
];
