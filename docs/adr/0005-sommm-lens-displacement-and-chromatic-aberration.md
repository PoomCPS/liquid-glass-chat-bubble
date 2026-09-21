# ADR 0005: SOMMM Lens Displacement & Chromatic Aberration Pipeline

## Context
Standard in-page SVG filter references (`backdrop-filter: url(#id)`) fail or get dropped in Chromium compositing. The reference implementation in `c:\Users\poomr\Downloads\SOMMM\glass` solves this by constructing dynamic SVG displacement maps as self-contained data URIs (`data:image/svg+xml;utf8,...#displace`) applied directly within `backdrop-filter`.

Furthermore, `SOMMM/glass` creates an authentic physical optical lens:
- An inner `#808080` rectangle (0 displacement) ensures that the message body and typography remain 100% distortion-free.
- Curved outer edge gradients (`#X` and `#Y`) refract the background inward along the perimeter.
- Triple-pass `feDisplacementMap` primitives on Red, Green, and Blue channels at scaled offsets produce true optical chromatic aberration prism dispersion on the glass rim.

## Decision
1. **Per-Bubble Measured Lens**:
   - Each chat bubble is observed via `ResizeObserver`.
   - On render/resize, dynamically generate the data-URI displacement filter matching the bubble's exact pixel dimensions and radius.
   - Apply the filter directly to `.glass-refract` underlay so `.bubble-content` typography sits on `z-index: 5` completely unaffected.
2. **Dual Optical Stacking**:
   - Stack the SOMMM lens underlay beneath the directional corner LED spotlight (Option A from Grilling).
   - This allows the directional light beam and focal glint to illuminate through the refractive chromatic bevel.
3. **Interactive HUD Controls**:
   - Expose sliders in the Settings HUD for *Edge Depth*, *Refraction Strength*, and *Chromatic Aberration*, defaulting to clean stream values (`depth: 8px`, `strength: 60`, `cab: 2`, `blur: 2px`).

## Consequences
- Authentic Apple iOS 27 glass refraction and chromatic prism edges render in Chromium and OBS Browser Source (CEF).
- Zero distortion on text, emotes, and user badges.
- Streamers can fine-tune refraction and dispersion live via the HUD.
