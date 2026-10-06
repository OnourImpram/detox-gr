# Detoks visual system, v4

Read docs/design/BRIEF-v4.md before changing the storefront. The old pine/walnut visual theme is superseded by the user's explicit redesign request. Product/commerce rules are not superseded.

Palette. Paper #F7F6F0, surface #ECEEE5, forest ink #253C31, body #374A40, secondary #59665C, clay #915138. Use semantic --dt-* tokens. Foreground contrasts must be measured on their actual surfaces.

Type. Self-hosted open-source Literata display face, Figtree body/interface. No external font requests. Fluid display capped at 88px desktop and 54px compact. Body 16–18px, metadata at least 12px. Product names are display type but remain readable in compact list mode.

Layout. Maximum 1440px. Side gutters 5vw up to 76px and 20px on compact screens. Deliberate editorial offsets on marketing surfaces. Product grids preserve alignment and do not imitate the editorial layout. Form and navigation controls remain predictable.

Motion. One photograph change with subtle settling. No autoplay, no initially invisible content, no stagger on every section, no scroll hijacking. Honor prefers-reduced-motion. Hover and pressed feedback communicate affordance.

Content. Real shop, real founder name, actual source catalogue. Generated images remain labelled, archive photographs do not acquire unverified product identity. Show preview/payment status concisely, never imply checkout is active.

Validation. All old behavioural suites remain. New design tests check token contrast, source preservation and real browser typography, mobile layouts, long translations, hero photo interaction and keyboard access. Screenshots must be inspected, not merely collected.
