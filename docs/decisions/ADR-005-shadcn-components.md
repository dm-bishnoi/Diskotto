# ADR-005: shadcn/ui for Component Library

## Status

**Accepted** - 2026-09-01

## Context

Diskotto needs a component library that provides:
- Accessible primitives (WCAG AA)
- Customizable to match design system
- TypeScript support
- Modern, clean aesthetic
- Copy-to-own (no dependency lock-in)
- Works with Tailwind CSS

### Options Considered

1. **shadcn/ui**
2. **Material UI (MUI)**
3. **Ant Design**
4. **Chakra UI**
5. **Mantine**
6. **Headless UI + custom styling**
7. **Radix UI + custom styling**

## Decision

We will use **shadcn/ui** for our component library.

## Rationale

### Why shadcn/ui

#### Copy-to-Own Philosophy
- **No dependency** - Code lives in your repo
- **Full control** - Modify anything
- **No version lock-in** - Update when you want
- **No breaking changes** - You own the code
- **Learn from it** - See how components are built

```bash
# Add a component
npx shadcn-ui@latest add button

# Component is now in your codebase
src/components/ui/button.tsx
```

#### Built on Radix UI
- **Accessibility** - WCAG compliant out of the box
- **Behavior** - Tested, proven patterns
- **Customization** - Unstyled, you control appearance
- **Modern** - React 18, TypeScript-first

#### Tailwind CSS Integration
- **Consistent** - Uses your design tokens
- **Customizable** - Change via Tailwind config
- **Performant** - Purged CSS, no bloat
- **Familiar** - Most web devs know Tailwind

#### TypeScript-First
- **Full types** - Every prop typed
- **Autocomplete** - IDE support
- **Refactoring** - Safe
- **Documentation** - JSDoc comments

#### Modern Aesthetic
- **Clean** - Minimal, professional
- **Customizable** - Match your brand
- **Accessible** - Not just pretty
- **Responsive** - Mobile-first

#### Active Community
- **Growing fast** - Very popular in 2024+
- **Many examples** - Production usage
- **Good docs** - Comprehensive
- **Regular updates** - Active maintenance

### Why Not Material UI (MUI)

#### Bundle Size
- **Large** - 92KB gzipped
- **Heavy** - Many features you don't need
- **Impact** - Slower load times

#### Opinionated
- **Material Design** - Google's design system
- **Hard to customize** - Override styles everywhere
- **Different aesthetic** - Doesn't match our vision

#### Dependency Lock-in
- **Major versions** - Breaking changes
- **Upgrades** - Painful
- **Customization** - Fighting the framework

#### Performance
- **Runtime CSS-in-JS** - Emotion/styled-components
- **Re-renders** - Can cause issues
- **Bundle bloat** - Hard to tree-shake

### Why Not Ant Design

#### Aesthetic
- **Dated** - Looks like 2015
- **Chinese-centric** - Design patterns differ
- **Heavy** - Lots of chrome

#### Bundle Size
- **Very large** - 200KB+ gzipped
- **Impact** - Significant

#### Customization
- **Difficult** - LessConfig-based
- **Override** - CSS specificity wars

#### Learning Curve
- **Different** - Chinese design patterns
- **Documentation** - Less comprehensive in English

### Why Not Chakra UI

#### Bundle Size
- **Medium** - 60KB gzipped
- **Better than MUI** - But still significant

#### Customization
- **Theme-based** - Good but limiting
- **Style props** - Verbose

#### Performance
- **Runtime** - Emotion-based
- **Re-renders** - Can be optimized but requires care

#### Community
- **Smaller** - Less momentum than shadcn/ui
- **V2 migration** - Was painful for some

### Why Not Mantine

#### Bundle Size
- **Medium** - 50KB gzipped
- **Good** - But not smallest

#### Opinionated
- **Style choices** - Some you can't change
- **Components** - Good but not as flexible

#### Community
- **Growing** - But smaller than shadcn/ui
- **Documentation** - Good but less comprehensive

### Why Not Headless UI + Custom

#### More Work
- **Build everything** - From scratch
- **Accessibility** - DIY
- **Time** - Weeks of work

#### Reinventing
- **Why?** - shadcn/ui does this already
- **Time better spent** - On product features

### Why Not Radix UI + Custom

#### Styling Work
- **Unstyled** - Need to style everything
- **Time** - Weeks of design + implementation
- **Consistency** - Hard to maintain

#### shadcn/ui does this
- **Already styled** - With Tailwind
- **Customizable** - You own the code
- **Best of both** - Radix behavior + Tailwind styles

## Implementation

### Setup

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Add components as needed
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add tooltip
```

### Configuration

```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

### Component Example

```typescript
// components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### Customization

Since we own the code, we can customize:

```typescript
// Add custom variant
const buttonVariants = cva(
  "...",
  {
    variants: {
      variant: {
        // ... existing variants
        scan: "bg-primary text-white hover:bg-primary-hover shadow-sm",
      },
    },
  }
);

// Use it
<Button variant="scan">Start Scan</Button>
```

## Consequences

### Positive
- **Full control** - Modify any component
- **No version lock-in** - Code in your repo
- **Small bundle** - Only what you use
- **Accessible** - Built on Radix
- **Customizable** - Match your design
- **TypeScript** - Full type safety
- **Tailwind** - Consistent with design system
- **Active community** - Growing fast

### Negative
- **More files** - Each component is a file
- **Manual updates** - Need to update yourself
- **Learning curve** - Tailwind + cva + Radix
- **Documentation** - Less than MUI
- **Initial setup** - More work than install package

### Mitigation Strategies

1. **File organization**
   - All UI components in `components/ui/`
   - Clear naming conventions
   - Good folder structure

2. **Updates**
   - Review changes before updating
   - Test after updates
   - Document changes

3. **Learning**
   - Document patterns internally
   - Share knowledge across team
   - Code reviews

## Component Inventory

### Core Components Needed

```bash
# Essential
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card

# Layout
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add sheet

# Overlays
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add toast

# Data Display
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add skeleton

# Forms
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add slider

# Feedback
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add command
```

## Alternatives Detailed Comparison

| Feature | shadcn/ui | MUI | Ant Design | Chakra | Mantine |
|---------|-----------|-----|------------|--------|---------|
| **Bundle Size** | Tiny | Large | Huge | Medium | Medium |
| **Customization** | Full | Limited | Limited | Good | Good |
| **Accessibility** | Excellent | Good | Good | Good | Good |
| **TypeScript** | Excellent | Excellent | Good | Good | Excellent |
| **Design System** | Tailwind | Material | Ant | Custom | Mantine |
| **Copy-to-Own** | Yes | No | No | No | No |
| **Performance** | Excellent | Good | Good | Good | Good |
| **Community** | Growing | Large | Large | Medium | Growing |
| **Documentation** | Good | Excellent | Good | Good | Good |
| **Maturity** | New | Mature | Mature | Mature | Mature |
| **Learning Curve** | Medium | Low | Low | Low | Low |

## References

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [shadcn/ui GitHub](https://github.com/shadcn-ui/ui)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Component Examples](https://ui.shadcn.com/examples)

## Decision Makers

- Technical Lead
- Frontend Architect
- UX Designer
- Senior Developers

## Date

2026-09-01

## Review Date

2027-03-01 (6 months)
