import { createContext, useContext, ReactNode } from 'react';
import { ThemeConfig, ColorScale, SemanticColors } from '../types/theme';

/**
 * Theme context value interface
 */
interface ThemeContextValue {
  theme: ThemeConfig;
}

/**
 * Default theme configuration based on design system
 */
const defaultTheme: ThemeConfig = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563EB', // Mountain Blue
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#059669', // Forest Green
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    semantic: {
      success: '#059669',
      warning: '#F59E0B',
      error: '#DC2626',
      info: '#0EA5E9',
    },
  },
  typography: {
    display: { fontSize: '48px', lineHeight: '1.2' },
    h1: { fontSize: '36px', lineHeight: '1.2' },
    h2: { fontSize: '30px', lineHeight: '1.3' },
    h3: { fontSize: '24px', lineHeight: '1.4' },
    h4: { fontSize: '20px', lineHeight: '1.4' },
    bodyLg: { fontSize: '18px', lineHeight: '1.6' },
    body: { fontSize: '16px', lineHeight: '1.6' },
    bodySm: { fontSize: '14px', lineHeight: '1.5' },
    caption: { fontSize: '12px', lineHeight: '1.4' },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

/**
 * Theme context
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Theme provider props
 */
interface ThemeProviderProps {
  children: ReactNode;
  theme?: Partial<ThemeConfig>;
}

/**
 * Theme provider component
 * Provides theme configuration to all child components
 */
export function ThemeProvider({ children, theme: customTheme }: ThemeProviderProps) {
  // Merge custom theme with default theme
  const theme: ThemeConfig = customTheme
    ? {
        ...defaultTheme,
        ...customTheme,
        colors: {
          ...defaultTheme.colors,
          ...customTheme.colors,
        },
      }
    : defaultTheme;

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to access theme context
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

/**
 * Hook to get specific theme values
 */
export function useThemeValue() {
  const { theme } = useTheme();
  
  return {
    colors: theme.colors,
    typography: theme.typography,
    spacing: theme.spacing,
    shadows: theme.shadows,
    borderRadius: theme.borderRadius,
    breakpoints: theme.breakpoints,
  };
}
