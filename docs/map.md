# Wayfinder Map: Liquid Glass Turbulence & Corner LED Spotlight Optics

## Destination
Upgrade stream chat overlay to authentic Ekino-France Liquid Glass optics: implement SVG turbulence-based refraction on an underlay layer, remove all border colors for a 100% neutral cut-glass bevel, and project role colors via a directional bottom-right corner LED spotlight.

## Notes
- Skills: `ponytail`, `domain-modeling`, `modern-web-guidance`
- Architecture: Zero-backend vanilla JS/CSS/SVG overlay for OBS Studio and browser source (CEF)
- Reference: [Liquid Glass in CSS (and SVG) | ekino-france](https://medium.com/ekino-france/liquid-glass-in-css-and-svg-839985fcb88d)

## Decisions so far
- [Inline Underlay Refraction](docs/adr/0004-turbulence-refraction-and-corner-led-spotlight.md) (Option A): Render SVG turbulence displacement on a dedicated `<span class="glass-refract">` underlay so text and emotes remain razor-sharp.
- [Neutral Optical Bevel](docs/adr/0004-turbulence-refraction-and-corner-led-spotlight.md) (Option A): Eliminate all colored borders; use a 100% colorless white specular key-light edge on the glass perimeter.
- [Directional Corner LED Spotlight](docs/adr/0004-turbulence-refraction-and-corner-led-spotlight.md) (Option A): Project role colors from a bottom-right LED spot origin with a hot focal beam and smooth inward falloff; calibrated to max 20% alpha transparency (`rgba(..., 0.14-0.20)`) for a soft, crystal-clear tint without color blobs.
- [Liquid Caustic Membrane & Distortion Scaling](docs/adr/0004-turbulence-refraction-and-corner-led-spotlight.md): Injected `.glass-liquid-caustic` underlay with SVG displacement (`scale="28"`) and specular caustics, wired to a live HUD slider (`0-60px`).
- [Arrival Turbulence Shimmer](docs/adr/0004-turbulence-refraction-and-corner-led-spotlight.md) (Option B): Subtle micro-shimmer on message arrival (`specularShimmer`) alongside gentle spring-in, settling into static crystal refraction to protect stream framerates at 60fps.

- [SOMMM Lens Displacement & Chromatic Aberration](docs/adr/0005-sommm-lens-displacement-and-chromatic-aberration.md): Channel-separated RGB displacement map data-URI generator matching `SOMMM/glass` for physical edge refraction and chromatic prism flares.

## Completed Tickets
1. [ticket-01-remove-border-color.md](docs/tickets/ticket-01-remove-border-color.md): Stripped all border coloring and established pure neutral optical bevel. (Completed)
2. [ticket-02-svg-turbulence-underlay.md](docs/tickets/ticket-02-svg-turbulence-underlay.md): Added `<span class="glass-refract">` in `app.js` and configured SVG turbulence displacement filter in `index.html`. (Completed)
3. [ticket-03-corner-led-spotlight.md](docs/tickets/ticket-03-corner-led-spotlight.md): Styled bottom-right directional LED cone spotlight and role spectrum lighting in `style.css`. (Completed)
4. [ticket-04-arrival-shimmer-and-obs-verification.md](docs/tickets/ticket-04-arrival-shimmer-and-obs-verification.md): Configured Option B subtle arrival shimmer and verified optical clarity in browser preview. (Completed)
5. [ticket-05-sommm-lens-displacement.md](docs/tickets/ticket-05-sommm-lens-displacement.md): Implemented SOMMM lens displacement and chromatic aberration data-URI generator with live HUD sliders. (Completed)

## Active Frontier Tickets
None currently active.

## Not yet specified
- Optional user slider control in HUD to dynamically dial in LED spotlight beam angle and intensity.
- Custom user-defined LED spotlight colors for custom badge roles.

## Out of scope
- Full Houdini PaintWorklet implementation (unsupported in OBS CEF and Safari).
- Server-side pre-rendered glass video streams.
