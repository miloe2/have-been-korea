# Design Guidelines

- Use a 4px spacing scale for padding, margin, gaps, sizes, and offsets whenever possible.
- Avoid Tailwind arbitrary-value classes such as `p-[10px]`, `border-[var(--color-border)]`, or one-off bracket values unless there is no reasonable token or utility available.
- Prefer existing Tailwind utilities and project design tokens before adding new custom values.
- Use the shared design system in `src/shared/design` as the first source for colors, spacing, typography, and reusable UI decisions.
- If a repeated style cannot be expressed cleanly with existing tokens, add or reuse a small shared style instead of duplicating arbitrary values across components.
- Map UI overlays should sit above Leaflet attribution/copyright controls when they would otherwise visually interfere with the product UI. Set wrapper z-index intentionally instead of letting Leaflet controls appear on top of app surfaces.
