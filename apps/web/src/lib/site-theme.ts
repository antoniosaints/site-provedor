import type { CSSProperties } from 'react';

export type SiteTemplate = 'classic' | 'hub' | 'orbit';

export type TemplateTheme = {
  primary: string;
  secondary: string;
  primaryText: string;
  secondaryText: string;
  primaryRgb: string;
  secondaryRgb: string;
};

export function normalizeHex(value: unknown, fallback: string) {
  const color = String(value ?? '').trim();
  if (/^#[0-9a-fA-F]{3}$/.test(color)) {
    return `#${color.slice(1).split('').map((digit) => digit + digit).join('')}`;
  }
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
  return fallback;
}

export function hexToRgb(color: string) {
  const hex = normalizeHex(color, '#0877c8').slice(1);
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16)
  ] as const;
}

export function readableText(color: string) {
  const [r, g, b] = hexToRgb(color);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#102133' : '#ffffff';
}

export function themeFromSettings(settings: any): TemplateTheme {
  const primary = normalizeHex(settings?.primaryColor, '#0877c8');
  const secondary = normalizeHex(settings?.secondaryColor, '#20c7a5');
  const primaryRgb = hexToRgb(primary).join(' ');
  const secondaryRgb = hexToRgb(secondary).join(' ');

  return {
    primary,
    secondary,
    primaryText: readableText(primary),
    secondaryText: readableText(secondary),
    primaryRgb,
    secondaryRgb
  };
}

export function alpha(rgb: string, opacity: number) {
  return `rgb(${rgb} / ${opacity})`;
}

export function templateVars(theme: TemplateTheme): CSSProperties {
  return {
    '--site-primary': theme.primary,
    '--site-secondary': theme.secondary,
    '--site-primary-rgb': theme.primaryRgb,
    '--site-secondary-rgb': theme.secondaryRgb
  } as CSSProperties;
}

export function buttonStyle(theme: TemplateTheme, variant: 'primary' | 'secondary' | 'accent' | 'dark' = 'primary'): CSSProperties {
  if (variant === 'secondary') {
    return {
      backgroundColor: '#ffffff',
      borderColor: alpha(theme.primaryRgb, 0.22),
      color: theme.primary
    };
  }

  if (variant === 'accent') {
    return {
      backgroundColor: theme.secondary,
      borderColor: theme.secondary,
      color: theme.secondaryText
    };
  }

  if (variant === 'dark') {
    return {
      backgroundColor: alpha(theme.primaryRgb, 0.18),
      borderColor: alpha(theme.primaryRgb, 0.34),
      color: '#ffffff'
    };
  }

  return {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
    color: theme.primaryText
  };
}

export function getSiteTemplate(settings: any): SiteTemplate {
  const template = settings?.siteTemplate;
  return template === 'hub' || template === 'orbit' ? template : 'classic';
}

export function isDarkTemplate(template: SiteTemplate) {
  return template === 'orbit';
}
