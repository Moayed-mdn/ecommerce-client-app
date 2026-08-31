/**
 * Theme Token Utilities
 * 
 * Extract theme settings and convert them to CSS custom properties (variables).
 * These utilities support dynamic theme styling across the storefront.
 */

import type { Theme, ThemeTokens, ThemeSettings } from '~~/types/theme';
import { darkenColor, lightenColor, isLightColor } from './colorUtils';

/**
 * Default theme values (fallback)
 */
const DEFAULT_THEME_VALUES = {
  colors: {
    primary: '#3b82f6',
    secondary: '#10b981',
    background: '#ffffff',
    text: '#1f2937',
    'text-muted': '#6b7280',
    border: '#e5e7eb',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  typography: {
    'heading-weight': '600',
    'body-weight': '400',
    'font-size-base': '16px',
    'line-height-base': '1.5',
    'letter-spacing-base': '0',
  },
  layout: {
    'container-width': '1280px',
    'spacing-unit': '8px',
    'border-radius': '8px',
    'header-height': '64px',
    'footer-padding': '48px',
  },
} as const;

/**
 * Extract theme tokens from theme settings
 * Converts theme settings into CSS custom property format
 */
export const extractThemeTokens = (theme: Theme | null): ThemeTokens => {
  const tokens: ThemeTokens = {};

  if (!theme) {
    const merged = flattenThemeSettings(DEFAULT_THEME_VALUES);
    applyAliases(merged);
    return merged;
  }

  // Handle runtime API format: theme.tokens.colorPrimary, theme.settings.radius
  // The runtime endpoint returns a compact format without nested settings.colors.
  const runtime = theme as unknown as Record<string, unknown>;
  const runtimeTokens = runtime.tokens as Record<string, string> | undefined;

  if (runtimeTokens) {
    tokens['--color-primary'] = runtimeTokens.colorPrimary ?? '';
    tokens['--color-secondary'] = runtimeTokens.colorSecondary ?? '';
    tokens['--color-background'] =
      runtimeTokens.colorSurface ??
      runtimeTokens.colorBackground ??
      '';
    tokens['--color-text'] = runtimeTokens.colorText ?? '';
    tokens['--color-text-muted'] = runtimeTokens.colorTextMuted ?? '';
    tokens['--color-border'] = runtimeTokens.colorBorder ?? '';
    tokens['--color-success'] = runtimeTokens.colorSuccess ?? '';
    tokens['--color-error'] = runtimeTokens.colorError ?? '';
    tokens['--color-warning'] = runtimeTokens.colorWarning ?? '';

    // Runtime API is the source of truth for fonts.
    if (runtimeTokens.fontBody) {
      tokens['--font-body'] = runtimeTokens.fontBody;
    }

    if (runtimeTokens.fontHeading) {
      tokens['--font-heading'] = runtimeTokens.fontHeading;
    }
  }

  // Handle legacy format: theme.settings.colors.primary
  if (theme.settings?.colors) {
    Object.entries(theme.settings.colors).forEach(([key, value]) => {
      if (value) {
        tokens[`--color-${kebabCase(key)}`] = value;
      }
    });
  }

  // Extract typography
  if (theme.settings?.typography) {
    const typo = theme.settings.typography;
    
    // Font families
    if (typo.headingFont) tokens['--theme-font-heading'] = typo.headingFont;
    if (typo.bodyFont) tokens['--theme-font-body'] = typo.bodyFont;
    
    // Font weights (convert to CSS values)
    if (typo.headingWeight) {
      tokens['--theme-font-weight-heading'] = {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      }[typo.headingWeight] || '600';
    }
    if (typo.bodyWeight) {
      tokens['--theme-font-weight-body'] = {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      }[typo.bodyWeight] || '400';
    }
    
    // Base font size
    if (typo.baseFontSize) {
      tokens['--theme-font-size-base'] = {
        sm: '14px',
        base: '16px',
        lg: '18px',
      }[typo.baseFontSize] || '16px';
    }
    
    // Line height
    if (typo.lineHeight) {
      tokens['--theme-line-height-base'] = {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
      }[typo.lineHeight] || '1.5';
    }
    
    // Letter spacing
    if (typo.letterSpacing) {
      tokens['--theme-letter-spacing-base'] = {
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
      }[typo.letterSpacing] || '0';
    }
    
    // Legacy fields for backward compatibility
    Object.entries(theme.settings.typography).forEach(([key, value]) => {
      if (value && !['headingFont', 'bodyFont', 'headingWeight', 'bodyWeight', 'baseFontSize', 'lineHeight', 'letterSpacing'].includes(key)) {
        tokens[`--font-${kebabCase(key)}`] = value;
      }
    });
  }

  // Extract layout settings
  if (theme.settings?.layout) {
    Object.entries(theme.settings.layout).forEach(([key, value]) => {
      if (value) {
        tokens[`--layout-${kebabCase(key)}`] = value;
      }
    });
  }

  // Apply defaults for missing values only
  // Convert default key names to match runtime API format (--colors-* -> --color-*)
  const defaultTokens = flattenThemeSettings(DEFAULT_THEME_VALUES);
  
  Object.entries(defaultTokens).forEach(([key, value]) => {
    // Normalize --colors-* to --color-* to match API format
    const normalizedKey = key.startsWith('--colors-')
      ? key.replace('--colors-', '--color-')
      : key;
    
    // Only add if not already present
    if (!tokens[normalizedKey]) {
      tokens[normalizedKey] = value;
    }
  });

  applyAliases(tokens);
  
  // CRITICAL: Compute hover colors dynamically from merchant's actual colors
  // This ensures hover states match the merchant's brand colors, not hardcoded values
  computeDynamicHoverColors(tokens);
  
  // Compute "on-*" contrast colors to ensure text-on-background readability
  computeOnColors(tokens);

  return tokens;
};

/**
 * Apply alias mappings so component-used variables (--color-bg-page, --color-text-primary)
 * are derived from API-returned variables (--color-background, --color-text).
 * Handles both --color-* (from API) and --colors-* (from DEFAULT_THEME_VALUES fallback).
 */
function applyAliases(tokens: ThemeTokens): void {
  // Background aliases
  const bgColor = tokens['--color-background'] || tokens['--colors-background'];
  if (bgColor) {
    tokens['--color-bg-page'] = bgColor;
    tokens['--color-bg-surface'] = bgColor;
    tokens['--color-bg-elevated'] = bgColor;
    tokens['--color-bg-card'] = bgColor;
    tokens['--color-bg-secondary'] = bgColor;
  }
  
  // Text aliases
  const textColor = tokens['--color-text'] || tokens['--colors-text'];
  if (textColor) {
    tokens['--color-text-primary'] = textColor;
    tokens['--color-text-secondary'] = textColor;
  }
  
  // Text muted alias
  const textMutedColor = tokens['--color-text-muted'] || tokens['--colors-text-muted'];
  if (textMutedColor) {
    tokens['--color-text-muted-alias'] = textMutedColor;
  }
  
  // Primary color aliases
  const primaryColor = tokens['--color-primary'] || tokens['--colors-primary'];
  if (primaryColor) {
    tokens['--color-primary-dark'] = primaryColor;
    tokens['--color-link'] = primaryColor;
  }
  
  // Border alias
  const borderColor = tokens['--color-border'] || tokens['--colors-border'];
  if (borderColor) {
    tokens['--color-border-default'] = borderColor;
  }
  
  // Status color aliases
  const errorColor = tokens['--color-error'] || tokens['--colors-error'];
  if (errorColor) {
    tokens['--red-error'] = errorColor;
  }
  
  const successColor = tokens['--color-success'] || tokens['--colors-success'];
  if (successColor) {
    tokens['--green-success'] = successColor;
  }
  
  const warningColor = tokens['--color-warning'] || tokens['--colors-warning'];
  if (warningColor) {
    tokens['--yellow-warning'] = warningColor;
  }
}

/**
 * Compute dynamic hover colors from merchant's actual brand colors
 * This replaces hardcoded hover colors in CSS with merchant-specific values
 * 
 * CRITICAL: This ensures buttons/links respect merchant's brand, not hardcoded colors
 */
function computeDynamicHoverColors(tokens: ThemeTokens): void {
  // Primary hover color
  const primaryColor = tokens['--color-primary'] || tokens['--colors-primary'];
  if (primaryColor) {
    // Check if background is light or dark to decide hover direction
    const bgColor = tokens['--color-background'] || tokens['--colors-background'] || '#ffffff';
    const isDarkBg = !isLightColor(bgColor);
    
    // Dark backgrounds: lighten on hover (better visibility)
    // Light backgrounds: darken on hover (standard pattern)
    tokens['--color-primary-hover'] = isDarkBg 
      ? lightenColor(primaryColor, 15)
      : darkenColor(primaryColor, 15);
  }
  
  // Secondary hover color
  const secondaryColor = tokens['--color-secondary'] || tokens['--colors-secondary'];
  if (secondaryColor) {
    const bgColor = tokens['--color-background'] || tokens['--colors-background'] || '#ffffff';
    const isDarkBg = !isLightColor(bgColor);
    
    tokens['--color-secondary-hover'] = isDarkBg
      ? lightenColor(secondaryColor, 15)
      : darkenColor(secondaryColor, 15);
  }
  
  // Accent hover color
  const accentColor = tokens['--color-accent'];
  if (accentColor) {
    const bgColor = tokens['--color-background'] || tokens['--colors-background'] || '#ffffff';
    const isDarkBg = !isLightColor(bgColor);
    
    tokens['--color-accent-hover'] = isDarkBg
      ? lightenColor(accentColor, 15)
      : darkenColor(accentColor, 15);
  }
}

/**
 * Compute "on-*" contrast text colors to ensure readability
 * when text is placed on a colored background.
 * 
 * Examples:
 *   --color-primary (bg)  →  --color-on-primary  (text color on primary bg)
 *   --color-secondary      →  --color-on-secondary
 *   --color-accent         →  --color-on-accent
 *   --color-background     →  --color-on-background
 * 
 * Uses YIQ-based brightness check: dark bg → white text, light bg → dark text.
 */
function computeOnColors(tokens: ThemeTokens): void {
  const darkText = '#111827';
  const lightText = '#ffffff';

  // On-primary
  const primaryColor = tokens['--color-primary'] || tokens['--colors-primary'];
  if (primaryColor) {
    tokens['--color-on-primary'] = isLightColor(primaryColor) ? darkText : lightText;
  }

  // On-secondary
  const secondaryColor = tokens['--color-secondary'] || tokens['--colors-secondary'];
  if (secondaryColor) {
    tokens['--color-on-secondary'] = isLightColor(secondaryColor) ? darkText : lightText;
  }

  // On-accent
  const accentColor = tokens['--color-accent'];
  if (accentColor) {
    tokens['--color-on-accent'] = isLightColor(accentColor) ? darkText : lightText;
  }

  // On-background (text color for page background)
  const bgColor = tokens['--color-background'] || tokens['--colors-background'];
  if (bgColor && !tokens['--color-on-background']) {
    tokens['--color-on-background'] = isLightColor(bgColor) ? darkText : lightText;
  }

  // On-surface (text color for surface/card backgrounds)
  const surfaceColor = tokens['--color-surface'] || bgColor;
  if (surfaceColor && !tokens['--color-on-surface']) {
    tokens['--color-on-surface'] = isLightColor(surfaceColor) ? darkText : lightText;
  }
}

/**
 * Flatten nested theme settings into CSS variables
 */
function flattenThemeSettings(settings: any, prefix: string = ''): ThemeTokens {
  const tokens: ThemeTokens = {};

  Object.entries(settings).forEach(([key, value]) => {
    const tokenKey = prefix ? `${prefix}-${kebabCase(key)}` : `--${key}`;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Nested object - recurse
      const nested = flattenThemeSettings(value, tokenKey);
      Object.assign(tokens, nested);
    } else if (value !== null && value !== undefined) {
      // Leaf value
      tokens[tokenKey] = String(value);
    }
  });

  return tokens;
}

/**
 * Convert camelCase or PascalCase to kebab-case
 */
function kebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Extract Google Fonts from theme typography settings.
 * Reads font families from the current runtime API (`tokens.fontBody` /
 * `tokens.fontHeading`) as well as legacy theme formats.
 */
export const extractGoogleFonts = (theme: Theme | null): string[] => {
  if (!theme) return [];

  const fonts = new Set<string>();
  
  // Handle runtime API format: theme.tokens.fontBody, theme.tokens.fontHeading
  const runtime = theme as unknown as Record<string, unknown>;
  const runtimeTokens = runtime.tokens as Record<string, string> | undefined;
  
  if (runtimeTokens) {
    const fontBody = runtimeTokens.fontBody;
    const fontHeading = runtimeTokens.fontHeading;
    
    if (fontBody && typeof fontBody === 'string') {
      const fontFamily = fontBody.split(',')[0]?.trim().replace(/['"]/g, '') ?? '';
      const systemFonts = ['system-ui', 'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'];
      if (fontFamily && !systemFonts.includes(fontFamily.toLowerCase())) {
        fonts.add(fontFamily);
      }
    }
    
    if (fontHeading && typeof fontHeading === 'string') {
      const fontFamily = fontHeading.split(',')[0]?.trim().replace(/['"]/g, '') ?? '';
      const systemFonts = ['system-ui', 'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'];
      if (fontFamily && !systemFonts.includes(fontFamily.toLowerCase())) {
        fonts.add(fontFamily);
      }
    }
  }

  // Handle legacy format: theme.settings.typography
  if (theme.settings?.typography) {
    const typography = theme.settings.typography;

    // Common font keys
    const fontKeys = ['heading', 'body', 'headingFont', 'bodyFont', 'display', 'mono'];

    fontKeys.forEach((key) => {
      const font = typography[key];
      if (font && typeof font === 'string') {
        // Extract the font family name (before any commas)
        const fontFamily = font.split(',')[0]?.trim().replace(/['"]/g, '') ?? '';
        
        // Skip system fonts
        const systemFonts = ['system-ui', 'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'];
        if (fontFamily && !systemFonts.includes(fontFamily.toLowerCase())) {
          fonts.add(fontFamily);
        }
      }
    });
  }

  return Array.from(fonts);
};

/**
 * Generate Google Fonts URL
 */
export const generateGoogleFontsUrl = (fonts: string[]): string | null => {
  if (!fonts.length) return null;

  const fontParams = fonts
    .map((font) => `family=${encodeURIComponent(font.replace(/\s+/g, '+'))}:wght@400;500;600;700`)
    .join('&');

  return `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;
};

/**
 * Get a specific theme token value
 */
export const getThemeToken = (tokens: ThemeTokens, key: string): string | undefined => {
  // Support both with and without -- prefix
  const normalizedKey = key.startsWith('--') ? key : `--${key}`;
  return tokens[normalizedKey];
};

/**
 * Validate theme tokens
 */
export const validateThemeTokens = (tokens: ThemeTokens): boolean => {
  // Check for required tokens
  const requiredTokens = [
    '--color-primary',
    '--color-background',
    '--color-text',
    '--font-body',
  ];

  return requiredTokens.every((token) => token in tokens && tokens[token]);
};

/**
 * Get theme token with fallback
 */
export const getThemeTokenWithFallback = (
  tokens: ThemeTokens,
  key: string,
  fallback: string
): string => {
  return getThemeToken(tokens, key) || fallback;
};
