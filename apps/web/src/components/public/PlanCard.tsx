import { CheckCircle2, MessageCircle, MapPinned } from 'lucide-react';
import { ButtonLink } from '../ui/Button';
import { Card } from '../ui/Card';
import { assetUrl } from '../../lib/api';
import { formatMoney, whatsappLink } from '../../lib/format';

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function PlanCard({ plan, whatsapp, message }: { plan: any; whatsapp?: string | null; message?: string | null }) {
  const benefits = Array.isArray(plan.benefits) ? plan.benefits : [];
  const complements = Array.isArray(plan.complements) ? plan.complements : [];
  const visibleComplements = complements.slice(0, 4);
  const hiddenComplements = complements.length - visibleComplements.length;

  return (
    <Card className={`relative flex h-full flex-col p-6 ${plan.featured ? 'border-brand-500 ring-2 ring-brand-100' : ''}`}>
      {plan.featured ? <span className="absolute right-4 top-4 rounded-full bg-signal px-3 py-1 text-xs font-bold text-white">Recomendado</span> : null}
      <p className="text-sm font-bold uppercase text-brand-700">{plan.type}</p>
      <h3 className="mt-2 font-display text-2xl font-bold text-brand-900">{plan.name}</h3>
      <div className="mt-4">
        <span className="font-display text-5xl font-bold text-ink">{plan.downloadMbps}</span>
        <span className="ml-1 text-lg font-bold text-slate-500">Mega</span>
      </div>
      {plan.uploadMbps ? <p className="mt-1 text-sm text-slate-500">Upload até {plan.uploadMbps} Mega</p> : null}
      <p className="mt-4 text-3xl font-extrabold text-brand-700">{formatMoney(plan.priceCents)}<span className="text-sm font-semibold text-slate-500">/mês</span></p>
      <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">{plan.description}</p>
      <div className="mt-5 grid gap-2">
        {benefits.map((benefit: string) => (
        <span key={benefit} className="flex items-center gap-2 text-sm font-semibold text-slate-700"><CheckCircle2 className="motion-icon text-signal" size={17} /> {benefit}</span>
        ))}
      </div>
      <div className="mt-auto grid gap-3 pt-6">
        {complements.length ? (
          <div className="border-t border-slate-200 pt-4 text-center">
            <p className="text-xs font-bold text-slate-500">Complementos inclusos</p>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              {visibleComplements.map((complement: any) => (
                <div key={complement.id ?? complement.name} className="grid w-16 justify-items-center gap-1">
                  {complement.logoUrl ? (
                    <img src={assetUrl(complement.logoUrl)} alt={complement.name} className="h-11 w-11 rounded-lg object-cover ring-1 ring-slate-200" />
                  ) : (
                    <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-50 text-xs font-extrabold text-brand-700 ring-1 ring-brand-100">{initials(complement.name)}</span>
                  )}
                  <span className="max-w-full truncate text-[11px] font-bold text-slate-600">{complement.name}</span>
                </div>
              ))}
              {hiddenComplements > 0 ? (
                <div className="grid w-16 justify-items-center gap-1">
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-600 ring-1 ring-slate-200">+{hiddenComplements}</span>
                  <span className="max-w-full truncate text-[11px] font-bold text-slate-600">mais</span>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
        <ButtonLink href={whatsappLink(whatsapp, `${message ?? 'Olá! Quero contratar'} ${plan.name}`)} target="_blank" rel="noreferrer"><MessageCircle className="motion-icon" size={17} /> Contratar</ButtonLink>
        <ButtonLink href="/cobertura" variant="secondary"><MapPinned className="motion-icon" size={17} /> Consultar cobertura</ButtonLink>
      </div>
      {plan.legalNotes ? <p className="mt-3 text-xs text-slate-400">{plan.legalNotes}</p> : null}
    </Card>
  );
}
