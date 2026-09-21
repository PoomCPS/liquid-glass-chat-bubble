# Stream Util (Glassmorphic OBS Stream Chat)

A zero-backend, client-side glassmorphic chat overlay for OBS supporting unified Twitch and YouTube feeds.

## Language

**Bubble Stack**:
A vertical collection of floating glass cards displaying active chat messages.
_Avoid_: Chat list, message log, feed container

**Source Badge**:
A visual platform indicator identifying whether a message originated from Twitch or YouTube.
_Avoid_: Platform icon, stream tag

**Liquid Glass**:
An optical material rendered using multi-variable backdrop refraction, directional specular borders, and neutral inner caustics without surface clouding.
_Avoid_: Glassmorphism, transparent box, blur card

**Neutral Optical Bevel**:
A 100% colorless perimeter reflecting ambient white key light along the top-left edge without any colored border stroke.
_Avoid_: Card border, colored stroke, neon outline

**Glass Refract Layer**:
An absolutely positioned optical underlay element (`span.glass-refract`) that applies SVG turbulence displacement mapping and backdrop blur without distorting text or emotes.
_Avoid_: Filtered container, blurry text box

**Corner LED Spotlight**:
A directional, conical beam of role-specific colored light projected into the bottom-right corner of the crystal glass tile with a high-intensity white specular focal glint at the vertex, a directional light shaft/spine, and smooth inward falloff capped at max 20% alpha transparency.
_Avoid_: Border tint, corner gradient outline, glowing border

**Arrival Turbulence Shimmer**:
A brief dynamic optical displacement ripple triggered when a new message bubble enters the stack, settling into calm refraction.
_Avoid_: Constant wobble, noisy distortion

**SOMMM Lens Displacement**:
A geometric lens displacement technique generating channel-separated SVG displacement maps as self-contained data URIs, creating curved edge refraction while keeping the center crystal-clear.
_Avoid_: Uniform wobble, flat blur, noisy texture

**Chromatic Aberration Bevel**:
The optical separation of Red, Green, and Blue color channels at the curved edge of the glass tile, producing realistic spectral prism highlights.
_Avoid_: Rainbow border, static color stroke, neon stroke

**Role Light Tuning**:
The assignment of LED spotlight spectrums to user roles (Teal/Cyan for Subscribers, Magenta/Rose for VIPs, Purple/Indigo for Mods, Radiant Amber for Broadcasters, Neutral White Prism for Viewers).
_Avoid_: Colored badge card, role border, internal glow spill

**Anonymous IRC Client**:
A browser-based WebSocket connection to Twitch's IRC edge without user authentication.
_Avoid_: Twitch bot, chat scraper
