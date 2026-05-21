import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  motion?: boolean;
};

export function Card({ className, motion = true, ...props }: CardProps) {
  return <div className={clsx(motion && 'motion-card', 'rounded-lg border border-slate-200 bg-white shadow-sm', className)} {...props} />;
}
