import type { ReactNode } from 'react';
import { buttonStyle, type TemplateTheme } from '../../lib/site-theme';

export function ThemedLink({
  href,
  children,
  theme,
  variant = 'primary',
  className = '',
  external = false
}: {
  href: string;
  children: ReactNode;
  theme: TemplateTheme;
  variant?: 'primary' | 'secondary' | 'accent' | 'dark';
  className?: string;
  external?: boolean;
}) {
  return (
    <a
      className={`motion-press inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-bold shadow-sm ${className}`}
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      style={buttonStyle(theme, variant)}
    >
      {children}
    </a>
  );
}
