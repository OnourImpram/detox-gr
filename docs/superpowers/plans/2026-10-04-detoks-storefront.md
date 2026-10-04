# Detoks implementation plan

## Sequence

1. Preserve main and implement on work/detoks-eu-storefront.
2. Add failing regression tests for launch gates, product eligibility, untrusted storage, discovery and locale URLs.
3. Implement strict preview/live boundaries and Shopify-only checkout routing.
4. Replace persistent personal order history with validated cart-only storage and legacy-data purging.
5. Rebuild shared discovery, product cards, home, product details, list and checkout layout.
6. Preserve the source catalogue and all locale targets. Label representative photos and reference prices.
7. Add CI evidence for tests, type/lint, catalogue audit, static/server builds and browser scenarios.
8. Investigate real browser failures before claiming completion. Preserve logs and screenshots.
9. Document launch responsibilities and a reusable small-business operating model.
10. Submit reviewable changes without merging main, deploying or activating payment.

## Remaining external work

Verified product information and photos, owner content approval, legal and tax review, carrier tariffs, Shopify configuration and actual test orders are separate launch requirements. They must not be fabricated or treated as completed by software tests.
