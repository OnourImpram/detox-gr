# v3 completion and deployment checks

The source recovery started from 61d3feb4bec530933a5a957d05b3ea24c54e1562. The four generated illustrations, media registry, original photography archive and retirement ledger were already integrated. The preceding browser run failed in two places. These failures were not treated as a completed release.

## Corrected boundaries

Visible UI language is now bound to the completed root loader through ContentLocale. The latest requested URL can change before its editorial dictionary loads, so it is not a safe rendering locale. The document shell also uses completed loader data. Tests exercise deliberately delayed, cold Greek, Finnish and German dictionary requests in fresh browser contexts. No missing translation is hidden by a Turkish fallback.

Header search verification now waits for the actual catalogue URL and rendered query result. Network idle alone is not proof of a completed client-side navigation. Its assertion still requires exactly one DT117 result.

The two vulnerable indirect development dependencies brace-expansion were updated from 1.1.18 to 1.1.21 and from 5.0.9 to 5.0.12. Other package records were preserved. The final CI runs a fresh npm audit, tests, type checking, lint, media integrity audits, static and server builds, all browser suites and server-rendered locale checks.

## Release proof

The Pages pipeline runs only on main or an explicitly requested dispatch. It writes build.json with the deployed commit. After deployment a separate verification job loads the actual public website in Chromium, verifies the four new currentSrc URLs on home and product pages, tests the saved selection, checks the Greek mobile view and compares all 16 WebP hashes. Screenshots and live-proof.json are retained as detoks-v3-live-proof. The quality artifact is detoks-v3-quality-evidence.

A merge or successful build is not evidence that the public page has updated. The live proof is required before claiming publication. This document describes the acceptance procedure, not a claim that a pending run already passed.

## Commercial boundary

The released site remains a catalogue preview. Payment, label, stock, legal, tax and destination approvals remain unchanged and closed. Generated compositions remain disclosed as illustrations. The 151 original photographs and 453 original derivatives remain unchanged. Four archive references are not certified SKU photographs. Products without verified media display a designed pending state rather than unrelated old AI images.
