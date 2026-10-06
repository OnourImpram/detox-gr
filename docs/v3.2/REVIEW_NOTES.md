# Review notes for the customer experience refinement

Reviewed against released 3.1.1, 2c01c20. This is an implementation self-review and automated browser review, not an independent human audit or certification.

## What the first full run established

Run 37438304068 exercised the new customer journeys and the existing storefront. All ten new journey scenarios and 35 narrow, tablet and desktop observations passed. Product media, thirty-scene integration and SSR scenarios also passed. The run correctly remained red because three other gates were not yet satisfied.

The editorial test's generic textarea selector became ambiguous after adding the read-only request preview. It now targets the editable message field, retaining the original form payload and no-persistence assertions. The delayed locale test expected the archive label in the old primary navigation. It now verifies the same translated label in its new footer location, while still delaying the dictionary, requiring ready content and preserving query and product selection.

The dependency audit reported GHSA-68fv-2mgg-jv7q in source-map-js 1.2.1. The reviewed advisory identifies 1.2.2 as patched. The exact package metadata was read from the npm registry. Only that lockfile package's version, resolved URL and integrity were changed. A structural comparison required every other dependency entry to remain unchanged. npm ci, npm audit, all 338 tests, types and lint passed in maintenance run 37439832143.

## Earlier concrete fixes

The first request-copy fallback test observed the DOM before the scheduled focus and selection had settled. It now waits for the actual required focused and selected state, rather than weakening the assertion. Copy confirmation also clears when the requested message changes.

A real browser reproduced focus leaving the mobile modal at the end of its Tab order. An explicit boundary handler now wraps forward and reverse navigation without interfering with intermediate native controls. The same handler protects product-image enlargement. The browser checks 18 forward and 18 reverse Tab presses, Escape, focus return and background scroll locking.

## Preserved boundaries

No media files or catalogue records were edited. Existing source IDs, original photo hashes, generated-scene records and publication holds stay intact. The local inquiry may contain an unknown-priced product, but transaction validation was not weakened. No messages are sent automatically and no free-text notes are persisted. Online payment is still disabled.

The generated static sharing metadata uses default Turkish content because a static path cannot negotiate query-string languages before JavaScript. The client still supports all twenty locales. Do not describe this as fully translated server-rendered sharing metadata.

The final quality run and public deployment checks remain the delivery authority. Do not count a step's continue-on-error conclusion as a pass. Read its outcome and inspect the saved reports.
