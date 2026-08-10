# Design System – MyApproved.com

Unified UI structure (Section + Container + design tokens). Brand colours (blue/yellow) stay as-is.

## Tokens

- **Spacing:** `--space-1` … `--space-6` (8px–64px)
- **Typography:** `--font-size-h1/h2/h3`, `--font-size-body`, `--line-height-*`
- **Section padding:** `--section-padding-y`, `--section-padding-y-lg`
- **Radius:** `--radius-default`, `--radius-lg`, `--radius-xl`
- **Shadow:** `--shadow-sm` … `--shadow-xl`
- **Containers:** `--container-main` (1200px), `--container-wide` (1400px), `--container-narrow` (896px), `--container-content` (768px)

## Components

- **Section** (`@/components/ui/Section`): `as="section"|"div"|"footer"`, `size="default"|"large"`. Vertical rhythm.
- **Container** (`@/components/ui/Container`): `size="main"|"wide"|"narrow"|"content"`. Max-width + horizontal padding.

## Tailwind

- `max-w-content`, `max-w-content-wide`, `max-w-content-narrow`
- `ds-1` … `ds-6` (spacing), `rounded-ds`, `rounded-ds-lg`, `shadow-ds-sm` … `shadow-ds-xl`
- Optional: `ds-heading-1`, `ds-heading-2`, `ds-body`, `ds-body-sm` (see `app/design-tokens.css`)

## Usage

- Wrap page content in `<Section><Container size="main|wide|narrow|content">…</Container></Section>`.
- Footer uses `<Section as="footer">` + `<Container size="wide">`.
- Replace `max-w-* mx-auto px-4 sm:px-6 lg:px-8` with `<Container size="…">` where appropriate.
