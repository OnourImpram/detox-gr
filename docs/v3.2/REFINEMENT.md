# Detoks 3.2. Customer experience refinement

Base release: 3.1.1, main commit 2c01c20b8744e1a05be7e930369115a2af6a3dd1.

## Corrected customer-facing defects

The by-kilogram source prices previously appeared beside a whole-number piece selector. The request list now distinguishes kilograms from packets. Customers may request quarter-kilo increments, with explicit gram presets and a separately rounded line estimate. A 250 g request at EUR 15.90 per kilo is shown as EUR 3.98. These are requested amounts, not claims of stocked package variants. Server checkout still rejects fractional variant counts and all launch approvals remain closed.

Live search previously lived in local input state until Enter. The query now follows the URL as it is typed, preserving a trailing space while composing multiword searches. Browser Back, locale changes and the new compact list view retain the query. Typo suggestions are drawn from actual catalogue words and are never applied silently. After loading more products, keyboard focus moves to the first new product.

Default featured discovery now starts with available illustrations and archive references, preserving the explicit curated order. It is not a best-seller claim and hides no products. The complete catalogue remains accessible through categories, search, sorting and progressive loading.

Case-sensitive phrase matching previously left inconsistent Turkish casing untranslated. Full-label matching now takes precedence and respects Unicode word boundaries. The immutable dictionary is compiled once per locale. Nine loofah body soaps have complete scent-specific titles in all twenty languages, instead of being described as food flavours. Source spelling fixes do not change catalogue IDs or URLs. This is not a claim that all catalogue language has received native editorial review.

Product images can be enlarged in a native modal dialog, with alternate-image navigation, focus containment, Escape and focus restoration. Generated and reference-image disclosures remain visible. The actual image files and all provenance registries are unchanged.

The request list shows quantities and price bases separately, supports copying the prepared message, and provides selectable text if clipboard access fails. Notes remain non-persistent. Product and list messages now include the current host and the deployment base, not unusable relative links. This origin handling is hydration-safe and does not hardcode the GitHub preview hostname.

The homepage has less repeated archive/process narration. Category imagery directs to real catalogue categories rather than a technical media showcase. The full archive and all thirty generated compositions remain accessible on their dedicated pages. The founder biography, gift and trade copy was tightened in all twenty editorial packs without inventing history, certification, production capacity or sales results. The original physiotherapy background and Komotini address are retained.

## Verification scope

Pure regression tests were added before the corresponding quantity, translation and sharing helpers. The red outputs were recorded locally. Existing test bodies and the 3.1 image mapping requirements remain unchanged.

`scripts/refinement-browser.mjs` exercises real search/back/view/language journeys, price calculation and persistence, clipboard success and expected denial, public sharing links, full-size image navigation, focus return and 20-language narrow layouts. It also runs against the public release with an explicit expected commit.

The existing complete quality workflow is retained and the new customer-journey suite is an additional required gate. The final CI and post-deployment artifacts, not a pre-written test count in this document, are the release evidence.

## Unchanged launch boundaries

No payment activation, stock approval, legal approval, verified image/SKU attestation or claimed delivery coverage was added. All 30 generated compositions and Taha's 151 real photographs are preserved. Fractional preview requests require explicit Shopify variant mapping before any future transactional launch. Automated checks are not a complete WCAG or independent security audit.
