# 3. Role-Tinted Chromatic Aberration Over Beveled Edges

We decided to apply role colors (Teal for Subscribers, Magenta for VIPs, Purple for Mods) exclusively to the **Chromatic Aberration (optical dispersion fringe)** along the refracted edges of the lens, rather than tinting the card body or drawing a flat colored border stroke. 

## Architectural Specification
1. **Hybrid High-Performance Shader**: Pairs multi-variable backdrop refraction (`blur(24px) saturate(200%)`) with an embedded SVG displacement lens and opposing dual-wavelength dispersion caustics.
2. **Dual-Wavelength Prism Split**:
   - **Subscriber**: Beveled edge refracts with a **Luminous Teal (`#00f2fe`) key light** dispersing into **Azure/Cyan (`#0284c7`)** on the opposing edge.
   - **VIP**: Beveled edge refracts with an **Electric Magenta (`#ff3cac`) key light** dispersing into **Violet/Rose (`#f43f5e`)** on the opposing edge.
   - **Moderator**: Beveled edge refracts with an **iOS Purple (`#af52de`) key light** dispersing into **Indigo (`#6366f1`)**.
   - **Viewer**: Neutral white/prismatic refraction (`rgba(255, 255, 255, 0.70)` to `rgba(255, 255, 255, 0.20)`).
3. **2.5px Dispersion Band Width**: A prominent, vibrant chromatic fringe optimized for 1080p60 stream video compression, ensuring roles are instantly identifiable while preserving a 100% neutral, crystal-clear card interior over streaming gameplay.
