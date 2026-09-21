# 4. Turbulence-Based Glass Refraction and Bottom-Corner LED Spotlight Illumination

## Context
Following the [Ekino-France Liquid Glass specification](https://medium.com/ekino-france/liquid-glass-in-css-and-svg-839985fcb88d), the chat bubble previously relied on CSS border gradient approximations for chromatic aberration. To achieve physical optical realism:
1. Colored borders are stripped completely in favor of a 100% colorless, neutral optical bevel.
2. SVG turbulence displacement (`<feTurbulence>` + `<feDisplacementMap>`) is introduced to organically warp background pixels behind the glass.
3. Role accents are decoupled from border strokes and reimagined as a directional colored LED spotlight aimed directly into the bottom-right corner of the crystal glass tile.

## Decision
1. **Dedicated Refraction Underlay Layer (`.glass-refract`)**:
   - Each chat bubble renders an absolutely positioned `<span class="glass-refract" aria-hidden="true">` behind its content.
   - This layer executes `backdrop-filter: url(#liquid-glass-filter) blur(...) saturate(...) brightness(...)`.
   - Text and user emotes (`.bubble-content`) sit undisturbed on top, preventing optical distortion on typography while background gameplay/video is warped.
2. **Neutral Optical Bevel**:
   - The perimeter is rendered with a 100% colorless specular white key light along the top-left edge (`rgba(255, 255, 255, 0.45)` down to `transparent`).
   - Zero colored borders or strokes exist on the card edges.
3. **Bottom-Right Directional LED Spotlight**:
   - Role colors are projected as an optical spotlight originating at the bottom-right corner (`100% 100%`).
   - Modeled with a high-intensity focal point, smooth conical beam falloff into the crystal interior, and delicate corner caustic glow (`radial-gradient`).
4. **Arrival Turbulence Shimmer**:
   - The turbulence displacement scale peaks briefly during the spring-in arrival transition (`liquidSpringIn`) and stabilizes into calm, static crystal refraction to preserve OBS streaming performance.
