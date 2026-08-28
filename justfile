# Lattice Cryptography course tasks.
# Run `just` for the list.

_default:
    @just --list --unsorted

# Everything: prose, sources, types, eslint
check: lint sources types eslint

# Prose style linter. `just lint` for all chapters, `just lint FILE` for one.
lint *files:
    @node scripts/lint-prose.mjs {{files}}

# Prose linter with warnings promoted to failures
lint-strict *files:
    @node scripts/lint-prose.mjs --strict {{files}}

# Unsourced-claim check across written chapters
sources *files:
    @node scripts/check-sources.mjs {{files}}

# TypeScript, no emit
types:
    @pnpm exec tsc --noEmit

# Next.js eslint
eslint:
    @pnpm exec eslint

# Dev server
dev:
    @pnpm dev

# Production build
build:
    @pnpm build

# Chapter counts by status
status:
    @node -e "const {listChapters,readChapter,isStub}=await import('./scripts/lib/mdx.mjs');const c=listChapters().map(x=>({...readChapter(x)}));const w=c.filter(x=>!isStub(x.body));console.log('chapters           ',c.length);console.log('written, published ',w.filter(x=>x.meta.status==='published').length);console.log('written, draft     ',w.filter(x=>x.meta.status!=='published').length);console.log('stubs              ',c.length-w.length);" --input-type=module

# Remove this session's hook bookkeeping
clean-session:
    @rm -rf .claude/.session-edits
