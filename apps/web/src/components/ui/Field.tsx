import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

type FieldWrapProps = {
  label: string;
  children: React.ReactNode;
};

export function FieldWrap({ label, children }: FieldWrapProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="h-11 rounded-lg border-slate-200 bg-white text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500" {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="min-h-28 rounded-lg border-slate-200 bg-white text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500" {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="h-11 rounded-lg border-slate-200 bg-white text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500" {...props} />;
}
