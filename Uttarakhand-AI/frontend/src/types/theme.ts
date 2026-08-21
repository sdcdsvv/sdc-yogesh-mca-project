// Design Token TypeScript Definitions

/**
 * Color scale interface for theme colors
 * Provides shades from 50 (lightest) to 900 (darkest)
 */
export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

/**
 * Semantic colors for UI states
 */
export interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
}

/**
 * Typography scale with font sizes and line heights
 */
export interface TypographyScale {
  display: { fontSize: string; lineHeight: string };
  h1: { fontSize: string; lineHeight: string };
  h2: { fontSize: string; lineHeight: string };
  h3: { fontSize: string; lineHeight: string };
  h4: { fontSize: string; lineHeight: string };
  bodyLg: { fontSize: string; lineHeight: string };
  body: { fontSize: string; lineHeight: string };
  bodySm: { fontSize: string; lineHeight: string };
  caption: { fontSize: string; lineHeight: string };
}

/**
 * Spacing scale based on 8px grid system
 */
export interface SpacingScale {
  xs: string;  // 4px
  sm: string;  // 8px
  md: string;  // 16px
  lg: string;  // 24px
  xl: string;  // 32px
  '2xl': string;  // 48px
  '3xl': string;  // 64px
}

/**
 * Shadow scale for elevation
 */
export interface ShadowScale {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

/**
 * Border radius scale
 */
export interface BorderRadiusScale {
  sm: string;   // 4px
  md: string;   // 8px
  lg: string;   // 12px
  xl: string;   // 16px
  '2xl': string;  // 24px
  full: string;   // 9999px
}

/**
 * Responsive breakpoints
 */
export interface Breakpoints {
  sm: string;   // 640px - Mobile landscape
  md: string;   // 768px - Tablet
  lg: string;   // 1024px - Desktop
  xl: string;   // 1280px - Large desktop
  '2xl': string;  // 1536px - Extra large
}

/**
 * Complete theme configuration
 */
export interface ThemeConfig {
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    neutral: ColorScale;
    semantic: SemanticColors;
  };
  typography: TypographyScale;
  spacing: SpacingScale;
  shadows: ShadowScale;
  borderRadius: BorderRadiusScale;
  breakpoints: Breakpoints;
}
