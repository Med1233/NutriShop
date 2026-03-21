# Design System (`@nutrishop/ui`)

## Overview

The design system is a standalone package at `packages/ui/` providing reusable React components with Tailwind CSS. It is framework-agnostic (no Next.js dependency) and includes Storybook for visual development and Vitest for testing.

## Setup

The frontend imports it as a workspace dependency:

```json
// frontend/package.json
"dependencies": {
  "@nutrishop/ui": "workspace:*"
}
```

Next.js transpiles it via:

```js
// frontend/next.config.js
transpilePackages: ['@nutrishop/ui'];
```

The frontend's Tailwind config scans the package source:

```js
// frontend/tailwind.config.js
content: ['./src/**/*.{js,ts,jsx,tsx}', '../packages/ui/src/**/*.{ts,tsx}'];
```

## Running

```bash
pnpm --filter @nutrishop/ui storybook       # Storybook on port 6006
pnpm --filter @nutrishop/ui test            # Run 57 component tests
pnpm --filter @nutrishop/ui test:watch      # Watch mode
pnpm --filter @nutrishop/ui lint            # Type-check
```

## Components

| Component       | Variants / Props                                                          | Usage                                             |
| --------------- | ------------------------------------------------------------------------- | ------------------------------------------------- |
| `Button`        | `variant`: primary, secondary, danger, ghost, outline; `size`: xs, sm, md | All interactive buttons                           |
| `LinkButton`    | `variant`: primary, outline, ghost; `as`: polymorphic component           | Navigation buttons (pass `as={Link}` for Next.js) |
| `Input`         | Standard HTML input props                                                 | Text inputs                                       |
| `Textarea`      | Standard HTML textarea props                                              | Multi-line inputs                                 |
| `Select`        | Standard HTML select props                                                | Dropdowns                                         |
| `FormField`     | `label`, `htmlFor`                                                        | Label + input wrapper                             |
| `FormRow`       | —                                                                         | 3-column grid for form inputs                     |
| `Card`          | `variant`: default, form, muted                                           | Bordered content containers                       |
| `CardHeader`    | `title` + action children                                                 | Section header with title + action                |
| `Badge`         | `color`, `bgColor`                                                        | Generic colored badge                             |
| `CategoryBadge` | `category`, `label`, `colors`                                             | Product category tags                             |
| `StatusBadge`   | `status`, `label`, `colors`                                               | Order status pills                                |
| `ProviderBadge` | `provider`                                                                | Auth provider badge (indigo)                      |
| `StatCard`      | `value`, `label`, `color`                                                 | Dashboard stat display                            |
| `StatGrid`      | `cols`: 2-5                                                               | Grid wrapper for StatCards                        |
| `Table`         | —                                                                         | Responsive table wrapper                          |
| `Th` / `Td`     | Standard th/td props                                                      | Styled table cells                                |
| `PageTitle`     | `color`: default, blue, red, violet, green                                | Role-colored page headings                        |
| `EmptyState`    | `message`, `actionLabel`, `actionHref`, `linkComponent`                   | Empty data states with CTA                        |
| `FilterPills`   | `options`, `active`, `onChange`                                           | Category/status filter buttons                    |
| `Tabs`          | `tabs`, `active`, `onChange`, `color`                                     | Tab navigation                                    |
| `Alert`         | `variant`: error, success                                                 | Error/success messages                            |
| `DetailPanel`   | —                                                                         | Expandable content panel                          |
| `ToggleButton`  | `expanded`, `onClick`, `color`                                            | Expand/collapse toggle                            |

## Polymorphic `as` Pattern

`LinkButton` and `EmptyState` avoid depending on `next/link`. Instead:

```tsx
// In the frontend — pass Next.js Link component
import Link from 'next/link';
import { LinkButton, EmptyState } from '@nutrishop/ui';

<LinkButton as={Link} href="/cart">Go to Cart</LinkButton>
<EmptyState message="Empty" actionLabel="Shop" actionHref="/" linkComponent={Link} />
```

In Storybook or non-Next.js contexts, the default `<a>` tag is used.

## Adding a New Component

1. Create `packages/ui/src/MyComponent.tsx`
2. Create `packages/ui/src/MyComponent.stories.tsx`
3. Create `packages/ui/src/MyComponent.test.tsx`
4. Export from `packages/ui/src/index.ts`
5. Import in the frontend: `import { MyComponent } from '@nutrishop/ui'`
