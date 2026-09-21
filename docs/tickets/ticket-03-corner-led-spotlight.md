# Ticket 3: Directional Bottom-Right Corner LED Spotlight

## Question
How do we project role colors as a directional LED spotlight beaming into the bottom-right corner of the glass tile, with a bright focal spot and smooth conical falloff?

## Type
wayfinder:task

## Implementation Details
1. In `style.css`, create a dedicated `.corner-led-spot` element or pseudo-element on the bubble:
   - Positioned at `bottom: 0; right: 0;`
   - Styled with an elliptical/conical directional beam:
     `radial-gradient(ellipse 140px 90px at 100% 100%, var(--led-spot-color) 0%, var(--led-spot-core) 18%, transparent 70%)`
   - Hot focal point at the corner apex (`box-shadow` or pseudo-element point glint).
2. Configure role LED wavelengths:
   - Subscriber: Electric Teal/Cyan (`#00f2fe` core, `#0284c7` beam)
   - VIP: Vivid Magenta/Rose (`#ff3cac` core, `#f43f5e` beam)
   - Moderator: Deep Indigo/Purple (`#af52de` core, `#6366f1` beam)
   - Broadcaster: Radiant Amber/Gold (`#f59e0b` core, `#d97706` beam)
   - Default Viewer: Crisp Optical Prism Flare (`rgba(56, 189, 248, 0.45)` to `rgba(244, 63, 94, 0.35)`)
