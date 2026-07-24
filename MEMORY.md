# Website Offer Project Memory

Last updated: 2026-07-24

## Current frontend decisions

- React/Vite frontend lives in `frontend/`.
- The hero is an automatic carousel rotating every 3 seconds.
- Users can change hero slides using dots, arrows, touch swipe, mouse drag, or pen drag.
- The active slide changes the copy, theme, and background artwork together.
- Desktop keeps the two-column hero with artwork beside the copy.
- At viewport widths up to 900px, artwork becomes the hero background and the separate image panel is hidden.
- Mobile/tablet navigation is intentionally hidden and may be introduced again later.
- Desktop navigation remains enabled.
- Mobile hero CTAs stay on one row. The WhatsApp label shortens to `WhatsApp`.
- Hero spacing uses natural content height rather than full-screen minimum heights.
- On regular phone widths, category and service cards use a compact two-column layout.
- Screens at 360px or narrower fall back to one card per row.
- Body and form text remain at accessible sizes; only mobile card typography is slightly compacted.
- Mobile/tablet carousel arrows are hidden; users swipe/drag or tap the dots.
- Desktop carousel arrows remain visible.
- A separate animated `View Offer` pill travels along the unused bottom edge of the hero without adding layout height.
- The offer pill jumps directly to the `offer` section.
- Mobile offer-pill travel uses the regular animation timing.
- Desktop offer-pill travel takes 16 seconds and pauses on hover or keyboard focus for reliable clicking.
- Original rotating hero labels remain visible: `Limited Introductory Programme`, `Designed for Every Screen`, and `Launch With Confidence`.
- The Offer section has a highlighted promotional card, responsive terms grid, and `Apply for This Offer` CTA.

## Hero image assets

- `frontend/public/images/hero/website-design.jpg`
- `frontend/public/images/hero/lead-generation.jpg`
- `frontend/public/images/hero/fast-launch.jpg`

The images are 1200×800 JPEG files and roughly 94–126 KB each. They can be replaced later while keeping the same filenames.

## Important implementation files

- `frontend/src/components/HeroSection.tsx`
- `frontend/src/components/OfferHeader.tsx`
- `frontend/src/styles/offer.css`

## Verification and deployment

- Use `npm run build` from `frontend/`.
- Repository remote: `https://github.com/manojrashinkar-sys/website-offer.git`
- Deployment branch: `main`
- Latest pushed UI commit: `419e4cf` (`Slow desktop offer pill and pause on interaction`)
