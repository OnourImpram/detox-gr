# Implementation record

Date: 2026-10-04. Base main 91948fc7ac53840cd3e4ef444e6010150e573e88. Work is isolated on work/detoks-eu-storefront. No deployment, merge or payment activation is authorized by this record.

## Implemented

Reconstructed home, navigation, product discovery, cards, product detail, preview list and checkout layout. Retained the walnut/copper identity and original source catalogue. Added a 20-locale copy layer with parity tests. Preserved multilingual URL state, including explicit Turkish selection.

Separated preview visibility from publication and sale approval. Added strict merchant, legal, tax, carrier, product, destination, stock and quantity gates. New checkout uses Shopify only. Removed silent Stripe fallback and masked legacy receipt identity. Removed persistent order and free-text personal data. Existing v4 records are sanitized and overwritten on rehydration.

Added source-price and representative-photo labels. Stopped displaying demo shipping amounts as payable totals. Preview is noindex and emits no transaction Offer claims. Kept product IDs stable when display names change. Original product copy, actual photos, legal review and operational data remain owner-controlled dependencies.

## Verification history

The initial regression run failed before implementation. The first implementation passed 54 tests. Extended storefront tests reached 66, and the complete executed suite passed 272 checks. Four named tests about external platform prompt documents are explicitly excluded when those documents are not shipped. They are not counted as passing tests. The existing test bodies were retained, and an isolated working directory prevents the shop's OG photograph from changing fixture results.

Type checking, lint and both Pages and Vercel server builds passed. Lint retains one existing React refresh warning in router.tsx. No claim of a completely warning-free build is made.

The first browser run found 320px horizontal overflow and static-shell hydration recovery. The narrow header and footer were corrected. The next run recorded 28 viewport/route observations and completed the interactive search, list, persistence and checkout-closed scenarios, but still failed the strict zero-error gate because hydration recovery occurred on direct loads.

The hydration failure was traced to a locale-dependent root loader ID in a prerendered static shell. The document is now separated with shellComponent, static route content is client-rendered, and production SSR remains enabled. Hydration errors are logged rather than suppressed. An additional regression assertion covers this boundary. The latest CI artifact, not a stale number in this document, is the final test authority.

## Evidence

Storefront quality Actions stores test, type, lint, catalogue and build logs, browser.json, desktop/mobile screenshots and source SHA256 checksums. No deployment job is included. Download artifacts promptly, retention is seven days. CI step outcomes must all be successful, including the browser gate, before considering this branch ready for review.

## Remaining launch requirements

Verified product photos, source price/unit confirmation, owner story approval, applicable label information, business/legal/tax review, actual carrier tariffs, approved country coverage, Shopify variants and real test orders. Twenty-locale key coverage is not native editorial certification. Automated viewport checks are not a complete accessibility audit. Dependencies and legacy CSS have not been exhaustively removed. The legacy Stripe creation function remains unreachable from new checkout routing and should be removed after receipt migration requirements are decided.
