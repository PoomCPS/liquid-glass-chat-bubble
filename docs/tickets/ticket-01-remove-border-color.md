# Ticket 1: Remove Border Color & Establish Neutral Optical Bevel

## Question
How do we strip all remaining color tint from `.chat-bubble` and `.chat-bubble::before` while enhancing the 100% colorless white specular key-light bevel along the top-left edge?

## Type
wayfinder:task

## Implementation Details
1. In `style.css`, remove all color stops from `.chat-bubble::before`.
2. Redefine `.chat-bubble::before` as a 100% colorless specular white bevel:
   - Top-left: crisp ambient white reflection `linear-gradient(135deg, rgba(255, 255, 255, 0.50) 0%, rgba(255, 255, 255, 0.08) 35%, transparent 70%)`
   - Perimeter: pure clear glass edge without color.
3. Remove color from `box-shadow` perimeter lines.
