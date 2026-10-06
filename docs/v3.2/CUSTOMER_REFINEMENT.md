# Detoks customer experience refinement

Base. Released 3.1.1, commit 2c01c20. User delegated implementation and publication, requesting substantive refinement rather than further image generation or another test-count report.

## Intended experience

A customer should understand whose shop this is, find a relevant product, see the distinction between an actual photograph and an illustrative composition, build a clear inquiry and reach the shop without needing a WhatsApp account. Preserve Taha, Gümülcine, the two shelves and the regional small-business model. Do not invent products, certifications, stock, origin, ownership of third-party products, testimonials or delivery promises.

## Findings and changes to make

1. Home repeats the archive and the same photographs in several full-width sections. Reduce competing sections, keep the archive and all thirty generated images accessible on their dedicated routes. Bring purposeful category and shop links into the main reading path.
2. Catalogue queries filter a local draft before entering the URL, so unsent search terms can disappear on navigation. Keep discovery state in the URL, add removable active filters, a compact list view and an optional pictured-products filter. Rank exact names above prose matches, offer bounded typo suggestions only when there are no results.
3. Product quantities do not distinguish kilograms from item counts. Explain the sale basis and include it in the inquiry. Unknown price is not zero and must not prevent a nontransactional inquiry. Do not weaken server-side sale gates.
4. Inquiry forms are WhatsApp-only. Add an inspectable message, copy with a manual fallback and the existing verified telephone contact. Do not add server storage or send a message automatically.
5. Improve keyboard/mobile navigation, product-gallery enlargement, focus return, touch targets and readable spacing. Keep truthful media labels but remove repeated boilerplate from the reading path.
6. Static deep-link HTML currently repeats home-page metadata and relative sharing images. Generate route-specific safe metadata, preserve noindex and unknown-route 404, then test actual hydration after the change.

## Implementation and verification sequence

Write failing behavioral tests. Implement discovery and inquiry primitives. Wire existing components. Refine home, copy and stylesheet. Add static metadata. Run tests, TypeScript and lint, then real browser journeys including keyboard, no clipboard API, a missing price, per-kg quantities, back navigation and narrow multilingual layouts. Read screenshots, do not equate no overflow with good design. Preserve media and catalogue hashes. Review the diff and run hosted CI before merging. Verify the public build and customer journeys after publication.

## Release boundaries

Online payments remain disabled. The original 151-photo archive and thirty generated compositions remain intact. No new commerce provider, account, dependency or tracking system is introduced. Automated checks do not certify legal compliance, native-language editorial approval or all assistive technologies.
