import { useId, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './Button';

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  size?: 'md' | 'lg' | 'xl';
  children: ReactNode;
  onClose: () => void;
};

const sizes = {
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl'
};

export function Modal({ open, title, description, size = 'lg', children, onClose }: ModalProps) {
  const titleId = useId();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className={clsx('max-h-[90vh] w-full overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-slate-900/10', sizes[size])}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id={titleId} className="font-display text-xl font-bold text-brand-900">{title}</h2>
            {description ? <p className="mt-1 text-sm font-semibold text-slate-500">{description}</p> : null}
          </div>
          <Button type="button" variant="ghost" className="h-9 w-9 shrink-0 px-0" onClick={onClose} aria-label="Fechar modal">
            <X size={18} />
          </Button>
        </div>
        <div className="max-h-[calc(90vh-5rem)] overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
