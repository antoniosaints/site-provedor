import { useQuery } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { api, assetUrl } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Status';
import { Seo } from '../../components/public/Seo';

export function AboutPage() {
  const { data, isLoading } = useQuery({ queryKey: ['company'], queryFn: () => api.get<any>('/api/public/company') });
  if (isLoading) return <main className="mx-auto max-w-7xl px-4 py-12"><Loading /></main>;
  const company = data?.company;
  const mvv = data?.missionVisionValues;
  const differentials = Array.isArray(company?.differentials) ? company.differentials : [];

  return (
    <main>
      <Seo title="Sobre nós | MEGANET" description={company?.shortDescription} />
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="motion-reveal">
            <p className="font-bold text-brand-700">Sobre nós</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-brand-900">{company?.aboutTitle}</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">{company?.aboutText}</p>
            {company?.history ? <p className="mt-4 leading-7 text-slate-600">{company.history}</p> : null}
          </div>
          <div className="motion-float min-h-80 overflow-hidden rounded-lg bg-brand-50 shadow-soft">
            {company?.institutionalImageUrl ? <img src={assetUrl(company.institutionalImageUrl)} alt="" className="h-full w-full object-cover" /> : (
              <div className="grid h-full min-h-80 place-items-center bg-[linear-gradient(135deg,#08355b,#0877c8)] p-10 text-center text-white">
                <p className="font-display text-5xl font-bold">MEGANET</p>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="motion-stagger grid gap-5 md:grid-cols-3">
          <Card className="p-6"><h2 className="font-display text-xl font-bold text-brand-900">Missão</h2><p className="mt-3 leading-7 text-slate-600">{mvv?.mission}</p></Card>
          <Card className="p-6"><h2 className="font-display text-xl font-bold text-brand-900">Visão</h2><p className="mt-3 leading-7 text-slate-600">{mvv?.vision}</p></Card>
          <Card className="p-6"><h2 className="font-display text-xl font-bold text-brand-900">Valores</h2><p className="mt-3 leading-7 text-slate-600">{mvv?.values}</p></Card>
        </div>
        <div className="mt-10">
          <h2 className="font-display text-3xl font-bold text-brand-900">Diferenciais</h2>
          <div className="motion-stagger mt-6 grid gap-3 md:grid-cols-2">
            {differentials.map((item: string) => <span key={item} className="motion-card flex gap-2 rounded-lg bg-white p-4 font-semibold shadow-sm"><CheckCircle2 className="motion-icon text-signal" /> {item}</span>)}
          </div>
        </div>
      </section>
    </main>
  );
}
