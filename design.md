# Liquid Glass Design Specification (iOS 27 Aesthetic)

## 1. Optical Principles & Philosophy

Liquid Glass simulates physical optical physics rather than 2020s flat "frosted plastic":
* **Ultra-Translucent Core**: 100% crystal-clear surface fill (`rgba(255, 255, 255, 0.0)`), with natural transparency so underlying stream video/artwork is clearly visible.
* **Refraction & Saturation**: Subtle backdrop blur (`blur(8px)`) with crisp saturation (`saturate(135%) brightness(104%)`) following `nikdelvin/liquid-glass` optics.
* **Delicate Specular Reflection**: Fine inner specular sheen (`inset 0 0 4px 0px rgba(250, 250, 250, 0.30)`) and razor-fine perimeter border (`0 0 0 0.5px rgba(255, 255, 255, 0.16)`).
* **Bottom-Right Chromatic Prism Rainbow Spectrum**:
  Chromatic aberration is concentrated **strictly at the bottom-right corner** as a realistic optical light flare (prism rainbow spectrum):
  * **Top-Left Corner**: Pure white specular reflection (`rgba(255, 255, 255, 0.55)` to `0.12`), zero color tint.
  * **Bottom-Right Corner**: Multi-stop spectral dispersion (white glint -> coral red -> amber -> emerald green -> cyan -> royal indigo -> violet -> transparent).
  * **Bottom-Right Glass Shade**: Soft, luminous chromatic caustic tint (`radial-gradient(circle at 100% 100%, var(--spectrum-shade) 0%, transparent 32%)`).
  * **Edges & Center**: 100% crystal-clear glass with subtle specular sheen.

---

## 2. The Optical Layers (CSS Architecture)

### Layer 1: Crystal-Clear Refraction & Natural Saturation
```css
backdrop-filter: blur(8px) saturate(135%) brightness(104%);
-webkit-backdrop-filter: blur(8px) saturate(135%) brightness(104%);
```

### Layer 2: 100% Crystal-Clear Glass Body with Bottom-Right Caustic Shade
```css
background-color: rgba(255, 255, 255, var(--glass-opacity, 0.0));
background-image: radial-gradient(
  circle at 100% 100%,
  var(--spectrum-shade) 0%,
  rgba(255, 255, 255, 0.02) 16%,
  transparent 32%
);
```

### Layer 3: Bottom-Right Only Chromatic Spectrum Dispersion Rim
```css
.chat-bubble::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: var(--card-radius);
  padding: 1.25px;
  background:
    /* Bottom-Right Corner ONLY: Chromatic Rainbow Spectrum Prism Light */
    radial-gradient(
      circle at 100% 100%,
      rgba(255, 255, 255, 0.95) 0%,
      var(--spectrum-1) 5%,
      var(--spectrum-2) 10%,
      var(--spectrum-3) 15%,
      var(--spectrum-4) 20%,
      var(--spectrum-5) 25%,
      var(--spectrum-6) 30%,
      transparent 42%
    ),
    /* Top-Left & Perimeter: Pure white specular glass reflection, zero color */
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.55) 0%,
      rgba(255, 255, 255, 0.12) 30%,
      transparent 60%,
      rgba(255, 255, 255, 0.08) 100%
    );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  pointer-events: none;
}
```

### Layer 4: Glass-Box Specular Glow
```css
box-shadow:
  inset 0 0 4px 0px rgba(250, 250, 250, 0.30),
  inset 0 1px 1px 0 rgba(255, 255, 255, 0.35),
  0 0 0 0.5px rgba(255, 255, 255, 0.16),
  0 4px 16px rgba(0, 0, 0, 0.22),
  0 10px 28px rgba(0, 0, 0, 0.28);
```

---

## 3. Component Specifications

### A. Card Geometry (Squircle)
* `border-radius: 18px;`
* `padding: 9px 14px;`
* `margin-bottom: 8px;`
* `contain: layout style;`

### B. Stream-Native Inline Layout
Elements are laid out continuously in a single cohesive flow:
`[Role Badges] [Username]: [Message Text & Emotes]`
*(Platform source icons removed per user specification)*.
