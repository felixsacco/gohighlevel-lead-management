# Design System – MyApproved.com

Unified UI structure (Section + Container + design tokens). Brand colours are the MyApproved palette (amber `#FFB800` + navy `#1A3A8A`).

## Where things live

- **Tokens:** `app/design-tokens.css` (imported into `app/globals.css`)
- **Tailwind extension:** `tailwind.config.ts`
- **Section:** `components/ui/Section.tsx`
- **Container:** `components/ui/Container.tsx`
- The rest of `components/ui/**` are Shadcn-style primitives (Button, Card, Dialog, …).

## Tokens

Defined as CSS custom properties on `:root` in `app/design-tokens.css`:

- **Brand colour:** `--color-navy-900` (#0A2463), `--color-navy-700` (#1A3A8A), `--color-amber` (#FFB800), `--color-amber-hover`, `--color-on-amber`
- **Spacing:** `--space-1` … `--space-6` (8px–64px)
- **Typography:** `--font-size-h1/h2/h3`, `--font-size-body`, `--font-size-body-sm`, plus the matching `--font-weight-*`, `--line-height-*`, `--letter-spacing-*` vars
- **Section rhythm:** `--section-padding-y` (= `--space-6`), `--section-padding-y-lg` (80px)
- **Radius:** `--radius-default` (12px), `--radius-lg` (16px), `--radius-xl` (20px)
- **Shadow:** `--shadow-sm` … `--shadow-xl`
- **Containers:** `--container-main` (1200px), `--container-wide` (1400px), `--container-narrow` (896px), `--container-content` (768px)
- **Horizontal padding:** `--container-padding-x` (= `--space-2`), `--container-padding-x-sm` (24px)

Utility classes are also emitted: `.ds-heading-1/2/3`, `.ds-body`, `.ds-body-sm`.

## Components

- **Section** (`components/ui/Section.tsx`): props `as="section"|"div"|"footer"`, `size="default"|"large"`. Renders `relative overflow-hidden` + vertical padding.
- **Container** (`components/ui/Container.tsx`): prop `size="main"|"wide"|"narrow"|"content"`. Renders max-width + horizontal padding (`data-ds="container"`).

## Usage

```tsx
import { Section, Container } from '@/components/ui';

<Section size="large">
  <Container size="main">
    {/* page content */}
  </Container>
</Section>
```

- Footer uses `<Section as="footer">` + `<Container size="wide">`.
- Replace `max-w-* mx-auto px-4 sm:px-6 lg:px-8` with `<Container size="…">` where appropriate.

## Brand authority

The design-token colour values are a convenience copy. The authoritative palette lives in the brand kit `docs/BRAND.md` (primary amber `#FFB800`, primary navy `#1A3A8A`, navy dark `#0A2463`, near-black `#111111`, off-white `#F1F5F9`).
