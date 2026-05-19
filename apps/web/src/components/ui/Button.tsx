import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-soft',
  secondary: 'bg-white text-brand-700 ring-1 ring-brand-100 hover:bg-brand-50',
  ghost: 'bg-transparent text-ink hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700'
};

type Props = {
  variant?: keyof typeof variants;
  children: ReactNode;
  className?: string;
};

export function Button({ variant = 'primary', className, ...props }: Props & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx('motion-press inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60', variants[variant], className)}
      {...props}
    />
  );
}

export function ButtonLink({ variant = 'primary', className, ...props }: Props & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={clsx('motion-press inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold', variants[variant], className)}
      {...props}
    />
  );
}
