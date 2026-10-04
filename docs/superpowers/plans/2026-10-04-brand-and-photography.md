# Brand and photography implementation plan

> Execution method. Native in this session, expressly delegated by the user. Tests before implementation, with a full regression run and visual review before delivery.

Goal. Complete the customer-facing site with a stronger brand narrative and all 151 supplied photographs.
Architecture. Keep TanStack Start, catalogue IDs, locale URLs and preview/live boundaries. Add audited media and a typed multilingual editorial layer. Shared components render consistent page layouts and honest external inquiries.
Tech stack. Existing React, TypeScript, CSS and Node test runner. Pillow for offline image derivatives. Playwright for browser verification. No new paid service.
Spec. docs/superpowers/specs/2026-10-04-brand-and-photography.md.

## Global constraints

Preserve 271 source records and 45 holds. Do not enable payment. No invented product identity, health benefit, biography or delivery rate. Native image names are traceable to original filenames. All new copy has twenty-locale parity. No personal data in persistent storage or inquiry test artifacts.

## Review focus

Unknown herbs and powders must not acquire exact SKU status. Very long Greek and German headings must fit narrow screens. Untranslated query input must survive locale switching. Gift/trade messages must name destination and selected concept without asserting a paid order. Shared-device clearing must actually remove persisted selection.

## Task 1. Audited photo archive

Files. scripts/brand-assets.test.mjs, scripts/prepare-photos.py, src/data/photo-archive.json, src/data/photo-approved.json, src/lib/photo-archive.ts, public/photos/taha-2026 and docs/brand/photo-register.csv.
Contract. Each photo has id, original, sha256, subject, group, status and variants. getExactPhoto(sourceId) returns only a separately approved mapping, never a visual candidate.
Tests. 151 unique IDs and originals, derivative paths and dimensions, no EXIF, no default exact product mappings, valid groups and all originals accounted for.

## Task 2. Brand and editorial content

Files. src/data/brand-copy.json, src/lib/brand-copy.ts, docs/brand/BRAND_BOOK.md and scripts/brand-content.test.mjs.
Contract. b(locale,key) is strict, applies parameters and cannot silently fall back. Every locale has every key. Write a new main proposition, founder story, practical customer process and complete content for all public pages.
Tests. All locale/key pairs nonempty, valid placeholders, no source commentary, no machine-like fill fallbacks, no health claims in new copy, no invented contact details.

## Task 3. Consistent pages and inquiry flow

Files. src/components/editorial.tsx, src/components/archive-photo.tsx, src/components/inquiry.tsx, src/lib/inquiry.ts, new shelf/journal routes and revised home/story/contact/gift/trade/delivery/legal routes. Modify shared shell, product image caption and CSS.
Contract. Photo rendering always uses srcset and observed descriptions. Inquiry link encodes a product-neutral inquiry, never calls a submission API. Privacy clear resets memory and removes persisted selection. Existing product discovery and checkout tests continue to pass.
Tests. Behavioral inquiry unit tests and browser scenarios on all pages, locales, breakpoints and interactions.

## Task 4. Delivery and audit trail

Run npm test, typecheck, lint, both builds and browser evidence. Inspect home, story, shelf, product and service-page screenshots. Create a provenance report and a reproducible release patch including all optimized assets. Update the existing PR, without merging main or activating commerce. Clearly report any data or approval still needed for real sales.
