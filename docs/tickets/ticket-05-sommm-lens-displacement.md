# Ticket 5: SOMMM Lens Displacement & Chromatic Aberration Pipeline

## Question
How do we port `SOMMM/glass`'s `getDisplacementFilter` and `getDisplacementMap` into `stream-util` to give each chat bubble measured physical edge refraction and chromatic aberration?

## Type
wayfinder:task (Completed)

## Implementation Details
1. In `app.js`, implement:
   - `getDisplacementMap({ height, width, radius, depth })`: Generates SVG gradient map with inner `#808080` zone.
   - `getDisplacementFilter({ height, width, radius, depth, strength, chromaticAberration })`: Generates channel-separated SVG filter data URI with R, G, B displacement and screen blending.
   - `applyBubbleLens(bubble)`: Computes and sets `backdropFilter` on `.glass-refract`.
   - Setup a `ResizeObserver` on active bubbles.
2. In `index.html`:
   - Add HUD sliders for *Edge Depth* (2px to 20px), *Refraction Strength* (10 to 150), and *Chromatic Aberration* (0 to 10).
3. In `style.css`:
   - Set `.glass-refract` defaults and ensure smooth transitions.
4. Verify in browser via browser subagent.
