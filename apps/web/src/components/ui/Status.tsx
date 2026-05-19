export function Loading() {
  return <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">Carregando...</div>;
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="font-bold text-slate-800">{title}</p>
      {text ? <p className="mt-2 text-sm text-slate-500">{text}</p> : null}
    </div>
  );
}
