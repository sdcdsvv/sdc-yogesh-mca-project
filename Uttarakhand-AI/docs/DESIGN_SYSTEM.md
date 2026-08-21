# Design System Implementation Guide

This document provides a quick reference for using the Uttarakhand Tourism design system.

## Overview

The design system is now configured with:
- ✅ Custom Tailwind configuration with nature-inspired colors
- ✅ TypeScript type definitions for theme and components
- ✅ Theme context provider for accessing design tokens

## Color Palette

### Primary Colors (Nature-Inspired)

```tsx
// Mountain Blue - Primary actions, links
className="bg-mountain-600 text-white"

// Forest Green - Success states, nature elements
className="bg-forest-600 text-white"

// Sky Blue - Informational elements
className="bg-sky-500 text-white"

// Temple Orange - Accent, CTAs
className="bg-temple-600 text-white"
```

### Secondary Colors

```tsx
// River Cyan
className="bg-river-500"

// Meadow Green
className="bg-meadow-500"

// Sunset Pink
className="bg-sunset-500"

// Earth Brown
className="bg-earth-700"
```

### Semantic Colors

```tsx
// Success
className="text-success"

// Warning
className="text-warning"

// Error
className="text-error"

// Info
className="text-info"
```

## Typography

Use the custom font size classes:

```tsx
<h1 className="text-display">Display Text</h1>
<h1 className="text-h1">Heading 1</h1>
<h2 className="text-h2">Heading 2</h2>
<h3 className="text-h3">Heading 3</h3>
<h4 className="text-h4">Heading 4</h4>
<p className="text-body-lg">Large body text</p>
<p className="text-body">Body text (minimum 16px)</p>
<p className="text-body-sm">Small body text</p>
<span className="text-caption">Caption text</span>
```

## Spacing (8px Grid)

```tsx
// Padding/Margin examples
className="p-xs"   // 4px
className="p-sm"   // 8px
className="p-md"   // 16px
className="p-lg"   // 24px
className="p-xl"   // 32px
className="p-2xl"  // 48px
className="p-3xl"  // 64px
```

## Shadows

```tsx
className="shadow-sm"   // Subtle
className="shadow-md"   // Default
className="shadow-lg"   // Elevated
className="shadow-xl"   // High elevation
className="shadow-2xl"  // Maximum elevation
```

## Border Radius

```tsx
className="rounded-sm"   // 4px
className="rounded-md"   // 8px
className="rounded-lg"   // 12px
className="rounded-xl"   // 16px
className="rounded-2xl"  // 24px
className="rounded-full" // Circular
```

## Animations

```tsx
// Fade in
className="animate-fade-in"

// Slide in from right
className="animate-slide-in-right"

// Slide in from left
className="animate-slide-in-left"

// Scale in
className="animate-scale-in"

// Shake (for errors)
className="animate-shake"

// Shimmer (for loading)
className="animate-shimmer"
```

## Transition Durations

```tsx
className="duration-micro"  // 100ms - Micro-interactions
className="duration-fast"   // 200ms - Quick transitions
className="duration-normal" // 300ms - Standard transitions
className="duration-slow"   // 500ms - Slow transitions
```

## Using Theme Context

### Wrap your app with ThemeProvider

```tsx
import { ThemeProvider } from './contexts';

function App() {
  return (
    <ThemeProvider>
      {/* Your app components */}
    </ThemeProvider>
  );
}
```

### Access theme values in components

```tsx
import { useTheme, useThemeValue } from './contexts';

function MyComponent() {
  // Get entire theme
  const { theme } = useTheme();
  
  // Or get specific values
  const { colors, spacing, typography } = useThemeValue();
  
  return (
    <div style={{ color: colors.primary[600] }}>
      Content
    </div>
  );
}
```

## Component Type Definitions

All component prop types are available:

```tsx
import { ButtonProps, CardProps, TabProps, InputProps } from './types';

// Use in your components
const Button: React.FC<ButtonProps> = ({ variant, size, children, ...props }) => {
  // Component implementation
};
```

## Responsive Breakpoints

```tsx
// Mobile first approach
className="text-sm md:text-base lg:text-lg"

// Breakpoints:
// sm: 640px   - Mobile landscape
// md: 768px   - Tablet
// lg: 1024px  - Desktop
// xl: 1280px  - Large desktop
// 2xl: 1536px - Extra large
```

## Accessibility Guidelines

### Minimum Touch Targets
- All interactive elements: 44px × 44px minimum on mobile

### Color Contrast
- Normal text: 4.5:1 contrast ratio minimum
- Large text (18px+): 3:1 contrast ratio minimum
- Interactive elements: 3:1 contrast ratio for focus states

### Font Sizes
- Minimum body text: 16px
- Support text resize up to 200%

## Example Component

```tsx
import { ButtonProps } from './types';

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'rounded-lg font-semibold transition-all duration-fast';
  
  const variantClasses = {
    primary: 'bg-mountain-600 hover:bg-mountain-700 text-white',
    secondary: 'border-2 border-mountain-600 text-mountain-600 hover:bg-mountain-50',
    ghost: 'text-mountain-600 hover:bg-mountain-50',
    danger: 'bg-error hover:bg-red-700 text-white',
  };
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-body-sm',
    md: 'h-10 px-4 text-body',
    lg: 'h-12 px-6 text-body-lg',
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};
```

## Next Steps

1. Start building atomic components (buttons, inputs, icons)
2. Create molecular components (cards, form groups, navigation items)
3. Build organism components (navbar, footer, feature tabs)
4. Implement page templates

Refer to the design document (`.kiro/specs/uttarakhand-tourism-ui-redesign/design.md`) for detailed specifications.
