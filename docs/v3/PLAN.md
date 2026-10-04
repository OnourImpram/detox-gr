# Detoks v3 Implementation Plan

Goal. Integrate the new artwork and ship a coherent, provenance-aware storefront update into GitHub.
Architecture. Pure media policy plus a data manifest and a shared product-media renderer. Retain existing React, TanStack and Shopify boundaries. Do not migrate frameworks or rebuild verified source product data.
Stack. Node 22, React 19, TanStack Start, TypeScript, Playwright, Pillow for asset derivatives.
Spec. docs/v3/DESIGN.md.

## Global constraints

No invented product identity. Generated art never becomes a verified photograph. All 151 archive records and 453 derived files are preserved. Twenty locales remain. Payments remain off. Existing main is not changed by this release preparation.

## Review focus

Responsive source selection can silently serve old WebP assets even after a JPEG replacement. Unknown products must not borrow another product's image. Base paths can be applied twice. Long translations and missing quantity rows can break cards. Returning to a catalogue must preserve filters and scroll position.

## Tasks

- [ ] T1. Regression tests for the four new versioned media records, retired asset references and approved-image precedence. Confirm red before implementation. Implement src/lib/product-media-policy.ts, src/lib/product-media.ts, src/data/product-media-v3.json and responsive files in public/media/v3. Test dimensions, hashes and provenance.
- [ ] T2. Connect src/components/product-media.tsx to cards, PDP and list. Remove category-as-product fallbacks and retired public media. Test all actual product entry points and fallback errors. Capture screenshots.
- [ ] T3. Align cards, improve home hierarchy and navigation/search. Enable router scroll restoration. Test back navigation and twenty-locale narrow screens. Keep typography and real photos.
- [ ] T4. Replace obsolete PWA references, version the release, add release readiness/media audit and document owner handoff. Extend CI with v3 browser tests and exact artifact IDs. No payment activation.
- [ ] T5. Run full unit/type/lint, both builds and full browser suites. Inspect failures and screenshots. Commit source and binaries to GitHub, read back hashes, wait for CI completion and update PR evidence.

## Ledger

Baseline. 289 tests passed locally. Exact baseline checksums matched. Four old image-only replacements were never committed to the current branch, so they will be imported with fresh paths and an explicit manifest rather than overwrite an outdated whole catalogue snapshot.

Ruling. Retain four explicit archive-reference associations for visually unambiguous whole cloves, rosebuds, star anise and cardamom. Label them as archive references, not verified SKU images. Never apply the references to oils, powders, mixes or a specific cinnamon cultivar. This adds a fourth provenance state without fabricating owner approvals.

Ruling. Two platform integration tests required deleted Grok assets. Replace those two obsolete requirements with inverse v3 contracts proving the platform cannot be reactivated and the independent manifest resolves. Retain the historical utility tests unchanged. Do not add another unexplained skip.

Ruling. The managed local Chromium blocks all URL navigation. Do not alter that policy. Run genuine browser verification in the repository's existing GitHub Actions environment and inspect its artifacts here. Local unit, lint and both build checks remain available.
