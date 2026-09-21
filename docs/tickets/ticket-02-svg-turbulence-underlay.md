# Ticket 2: Add Inline Refraction Underlay Layer & SVG Filter

## Question
How do we integrate Ekino-France's SVG turbulence displacement filter into each chat bubble without distorting text and emotes?

## Type
wayfinder:task

## Implementation Details
1. In `index.html`, configure the SVG optical filter `#liquid-glass-lens`:
   - `<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" result="noise" />`
   - `<feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />`
2. In `app.js`, inject an underlay `<span class="glass-refract" aria-hidden="true"></span>` as the first child of each `.chat-bubble`.
3. In `style.css`, position `.glass-refract` absolutely (`inset: 0`), set `backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness))`, and apply the SVG displacement filter on the underlay.
