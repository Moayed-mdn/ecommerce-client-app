/**
 * Font Loader Utilities
 * 
 * Dynamic font loading utilities for theme system.
 * Supports Google Fonts and custom font loading.
 */

import type { Theme } from '~~/types/theme';
import { extractGoogleFonts } from './themeTokens';

/**
 * Load Google Fonts dynamically
 * Creates link elements in the document head
 * 
 * @param fonts - Array of font family names
 * @param weights - Font weights to load (default: 400,500,600,700)
 * @param display - Font display strategy (default: 'swap')
 */
export const loadGoogleFonts = (
  fonts: string[],
  weights: number[] = [400, 500, 600, 700],
  display: 'auto' | 'block' | 'swap' | 'fallback' | 'optional' = 'swap'
): void => {
  if (process.server) return;
  if (!fonts.length) return;

  // Filter out system fonts
  const systemFonts = ['system-ui', 'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'];
  const googleFonts = fonts.filter(
    (font) => !systemFonts.includes(font.toLowerCase().trim())
  );

  if (!googleFonts.length) return;

  const fontParams = googleFonts
    .map((font) => {
      const family = encodeURIComponent(font).replace(/%20/g, '+');
      const wght = weights.join(';');
      return `family=${family}:wght@${wght}`;
    })
    .join('&');

  const href = `https://fonts.googleapis.com/css2?${fontParams}&display=${display}`;

  // Check if link already exists
  const existingLink = document.querySelector(`link[href="${href}"]`);
  if (existingLink) {
    console.debug('Google Fonts already loaded:', googleFonts);
    return;
  }

  // Create and append link element
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.setAttribute('data-theme-fonts', 'google');
  link.crossOrigin = 'anonymous';

  // Optional: Add preconnect for performance
  if (!document.querySelector('link[href="https://fonts.googleapis.com"]')) {
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect1);

    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect2);
  }

  document.head.appendChild(link);

  console.info('Loaded Google Fonts:', googleFonts);
};

/**
 * Remove Google Fonts loaded by theme system
 */
export const removeGoogleFonts = (): void => {
  if (process.server) return;

  const links = document.querySelectorAll('link[data-theme-fonts="google"]');
  links.forEach((link) => link.remove());

  console.info('Removed Google Fonts');
};

/**
 * Preload a font for better performance
 * Use this for critical fonts that should load immediately
 * 
 * @param fontUrl - URL to the font file
 * @param fontFormat - Font format (woff2, woff, ttf, etc.)
 */
export const preloadFont = (fontUrl: string, fontFormat: string = 'woff2'): void => {
  if (process.server) return;

  // Check if already preloaded
  const existing = document.querySelector(`link[href="${fontUrl}"][rel="preload"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.type = `font/${fontFormat}`;
  link.href = fontUrl;
  link.crossOrigin = 'anonymous';
  link.setAttribute('data-theme-fonts', 'preload');

  document.head.appendChild(link);
};

/**
 * Load custom font from URL
 * Creates @font-face rule dynamically
 * 
 * @param family - Font family name
 * @param url - URL to the font file
 * @param weight - Font weight (default: 400)
 * @param style - Font style (default: 'normal')
 * @param format - Font format (default: 'woff2')
 */
export const loadCustomFont = (
  family: string,
  url: string,
  weight: number = 400,
  style: 'normal' | 'italic' = 'normal',
  format: string = 'woff2'
): void => {
  if (process.server) return;

  const fontFace = `
    @font-face {
      font-family: '${family}';
      src: url('${url}') format('${format}');
      font-weight: ${weight};
      font-style: ${style};
      font-display: swap;
    }
  `;

  const styleId = `custom-font-${family.replace(/\s+/g, '-').toLowerCase()}-${weight}-${style}`;

  // Check if already loaded
  if (document.getElementById(styleId)) return;

  const styleEl = document.createElement('style');
  styleEl.id = styleId;
  styleEl.textContent = fontFace;
  styleEl.setAttribute('data-theme-fonts', 'custom');

  document.head.appendChild(styleEl);

  console.info(`Loaded custom font: ${family} (${weight}, ${style})`);
};

/**
 * Remove custom fonts loaded by theme system
 */
export const removeCustomFonts = (): void => {
  if (process.server) return;

  const styles = document.querySelectorAll('style[data-theme-fonts="custom"]');
  styles.forEach((style) => style.remove());

  const preloads = document.querySelectorAll('link[data-theme-fonts="preload"]');
  preloads.forEach((link) => link.remove());

  console.info('Removed custom fonts');
};

/**
 * Check if a font is available in the browser
 * Uses FontFaceSet API if available
 * 
 * @param fontFamily - Font family name to check
 */
export const isFontAvailable = async (fontFamily: string): Promise<boolean> => {
  if (process.server) return false;

  // Modern browsers with FontFaceSet API
  if ('fonts' in document) {
    try {
      await document.fonts.load(`16px "${fontFamily}"`);
      const available = document.fonts.check(`16px "${fontFamily}"`);
      return available;
    } catch (e) {
      console.warn(`Could not check font availability: ${fontFamily}`, e);
      return false;
    }
  }

  // Fallback: assume font is available
  return true;
};

/**
 * Wait for fonts to load
 * Resolves when all fonts are loaded or after timeout
 * 
 * @param timeout - Maximum time to wait in ms (default: 3000)
 */
export const waitForFontsLoad = (timeout: number = 3000): Promise<void> => {
  if (process.server) return Promise.resolve();

  return new Promise((resolve) => {
    if ('fonts' in document && document.fonts.ready) {
      // Use FontFaceSet API
      const timeoutId = setTimeout(() => {
        console.warn('Font loading timeout reached');
        resolve();
      }, timeout);

      document.fonts.ready
        .then(() => {
          clearTimeout(timeoutId);
          console.info('All fonts loaded');
          resolve();
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          console.warn('Font loading failed:', err);
          resolve();
        });
    } else {
      // Fallback: just wait a bit
      setTimeout(resolve, Math.min(timeout, 1000));
    }
  });
};

/**
 * Get list of available fonts on the system
 * Note: This is limited by browser security
 */
export const getSystemFonts = (): string[] => {
  // Common system fonts that are widely available
  return [
    // Sans-serif
    'Arial',
    'Helvetica',
    'Verdana',
    'Tahoma',
    'Trebuchet MS',
    'Segoe UI',
    'Roboto',
    'Ubuntu',
    
    // Serif
    'Georgia',
    'Times New Roman',
    'Times',
    'Palatino',
    'Garamond',
    
    // Monospace
    'Courier New',
    'Courier',
    'Monaco',
    'Consolas',
    'Menlo',
    
    // Generic
    'system-ui',
    'sans-serif',
    'serif',
    'monospace',
  ];
};

/**
 * Generate font link objects for Nuxt useHead (SSR-compatible).
 * Reads font families from the current runtime API (`tokens.fontBody` /
 * `tokens.fontHeading`) as well as legacy theme formats.
 */
export const generateFontLinks = (
  theme: Theme | null,
  weights: number[] = [400, 500, 600, 700],
  display: 'auto' | 'block' | 'swap' | 'fallback' | 'optional' = 'swap'
): Array<{ rel: string; href: string; crossorigin?: string }> => {
  if (!theme) return [];

  const fontNames = extractGoogleFonts(theme);
  if (!fontNames.length) return [];

  const fontParams = fontNames
    .map((font) => {
      const family = encodeURIComponent(font).replace(/%20/g, '+');
      const wght = weights.join(';');
      return `family=${family}:wght@${wght}`;
    })
    .join('&');

  const googleFontsUrl = `https://fonts.googleapis.com/css2?${fontParams}&display=${display}`;

  return [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: '',
    },
    {
      rel: 'stylesheet',
      href: googleFontsUrl,
    },
  ];
};
