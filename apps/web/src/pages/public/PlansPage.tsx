import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ArrowRight, CheckCircle2, SlidersHorizontal, Wifi } from 'lucide-react';
import { api } from '../../lib/api';
import { formatMoney, whatsappLink } from '../../lib/format';
import { alpha, getSiteTemplate, isDarkTemplate, templateVars, themeFromSettings, type TemplateTheme } from '../../lib/site-theme';
import { PlanCard } from '../../components/public/PlanCard';
import { Seo } from '../../components/public/Seo';
import { ThemedLink } from '../../components/public/ThemedLink';
import { Select } from '../../components/ui/Field';
import { Loading } from '../../components/ui/Status';

function planBenefits(plan: any) {
  return Array.isArray(plan?.benefits) ? plan.benefits.slice(0, 4) : [];
}

function ThemedPlanCard({ plan, theme, template, whatsapp, message }: { plan: any; theme: TemplateTheme; template: string; whatsapp?: string | null; message?: string | null }) {
  const dark = template === 'orbit';

  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-lg border p-6 shadow-sm ${dark ? 'bg-white/[0.07] text-white backdrop-blur' : 'bg-white text-slate-950'}`}
      style={{
        borderColor: dark ? 'rgb(255 255 255 / 0.12)' : alpha(theme.primaryRgb, 0.14),
        boxShadow: dark ? `0 22px 70px ${alpha(theme.primaryRgb, 0.18)}` : undefined
      }}
    >
      <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full blur-2xl" style={{ backgroundColor: alpha(theme.secondaryRgb, dark ? 0.22 : 0.13) }} />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-md px-2.5 py-1 text-[11px] font-extrabold uppercase" style={{ backgroundColor: dark ? 'rgb(255 255 255 / 0.1)' : alpha(theme.primaryRgb, 0.1), color: dark ? 'rgb(255 255 255 / 0.78)' : theme.primary }}>
            {plan.type}
          </span>
          {plan.featured ? <span className="rounded-md px-2.5 py-1 text-[11px] font-extrabold uppercase" style={{ backgroundColor: alpha(theme.secondaryRgb, dark ? 0.18 : 0.12), color: theme.secondary }}>Recomendado</span> : null}
        </div>
        <h2 className={`mt-5 font-display text-2xl font-black ${dark ? 'text-white' : 'text-brand-900'}`}>{plan.name}</h2>
        <div className="mt-5 flex items-end gap-2">
          <span className="font-display text-6xl font-black leading-none">{plan.downloadMbps}</span>
          <span className={`pb-2 text-sm font-bold uppercase ${dark ? 'text-white/55' : 'text-slate-500'}`}>Mega</span>
        </div>
        {plan.uploadMbps ? <p className={`mt-2 text-sm font-semibold ${dark ? 'text-white/55' : 'text-slate-500'}`}>Upload ate {plan.uploadMbps} Mega</p> : null}
        <p className="mt-5 text-3xl font-black" style={{ color: theme.secondary }}>{formatMoney(plan.priceCents)}<span className={`text-sm ${dark ? 'text-white/55' : 'text-slate-500'}`}>/mes</span></p>
        <p className={`mt-4 min-h-14 text-sm leading-6 ${dark ? 'text-white/68' : 'text-slate-600'}`}>{plan.description}</p>
      </div>
      <div className="relative mt-5 grid gap-2">
        {planBenefits(plan).map((benefit: string) => (
          <span key={benefit} className={`flex items-center gap-2 text-sm font-semibold ${dark ? 'text-white/82' : 'text-slate-700'}`}>
            <CheckCircle2 size={16} style={{ color: theme.secondary }} /> {benefit}
          </span>
        ))}
      </div>
      <div className="relative mt-auto grid gap-3 pt-6">
        <ThemedLink className="w-full" href={whatsappLink(whatsapp, `${message ?? 'Ola! Quero contratar'} ${plan.name}`)} theme={theme} variant={dark ? 'accent' : 'primary'} external>
          Contratar <ArrowRight size={16} />
        </ThemedLink>
        <ThemedLink className="w-full" href="/cobertura" theme={theme} variant={dark ? 'dark' : 'secondary'}>
          Consultar cobertura
        </ThemedLink>
      </div>
    </article>
  );
}

export function PlansPage() {
  const [sort, setSort] = useState('featured');
  const [type, setType] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['plans', sort, type], queryFn: () => api.get<any>(`/api/public/plans?sort=${sort}${type ? `&type=${type}` : ''}`) });
  const settings = useQuery({ queryKey: ['public-settings'], queryFn: () => api.get<any>('/api/public/settings') });
  const siteSettings = settings.data?.settings;
  const company = settings.data?.company;
  const theme = themeFromSettings(siteSettings);
  const template = getSiteTemplate(siteSettings);
  const dark = isDarkTemplate(template);
  const isClassic = template === 'classic';

  if (isClassic) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Seo title="Planos de internet | MEGANET" description="Conheca os planos residenciais, empresariais e dedicados da MEGANET." />
        <div className="motion-reveal flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-bold" style={{ color: theme.primary }}>Planos</p>
            <h1 className="font-display text-4xl font-bold text-brand-900">Internet para cada tipo de uso</h1>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Todos os tipos</option>
              <option value="residencial">Residencial</option>
              <option value="empresarial">Empresarial</option>
              <option value="dedicado">Dedicado</option>
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Destaque</option>
              <option value="price">Menor preco</option>
              <option value="speed">Maior velocidade</option>
            </Select>
          </div>
        </div>
        {isLoading ? <div className="mt-8"><Loading /></div> : (
          <div className="motion-stagger mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data?.data?.map((plan: any) => <PlanCard key={plan.id} plan={plan} whatsapp={company?.whatsapp} message={siteSettings?.whatsappContractMessage} />)}
          </div>
        )}
      </main>
    );
  }

  return (
    <main className={`${dark ? 'bg-slate-950 text-white' : 'bg-[#f4f8fb] text-slate-950'}`} style={templateVars(theme)}>
      <Seo title="Planos de internet | MEGANET" description="Conheca os planos residenciais, empresariais e dedicados da MEGANET." />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: dark ? `radial-gradient(circle at 20% 20%,${alpha(theme.primaryRgb, 0.42)},transparent 28%),radial-gradient(circle at 82% 10%,${alpha(theme.secondaryRgb, 0.28)},transparent 24%)` : `linear-gradient(120deg,${alpha(theme.primaryRgb, 0.12)},transparent 48%),radial-gradient(circle at 84% 20%,${alpha(theme.secondaryRgb, 0.18)},transparent 26%)` }} />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-black uppercase tracking-[0.16em]" style={{ backgroundColor: dark ? 'rgb(255 255 255 / 0.08)' : alpha(theme.primaryRgb, 0.1), color: dark ? theme.secondary : theme.primary }}>
                <Wifi size={15} /> Planos de fibra
              </span>
              <h1 className={`mt-5 font-display text-5xl font-black leading-none ${dark ? 'text-white' : 'text-brand-900'}`}>Internet para cada tipo de uso</h1>
              <p className={`mt-5 max-w-2xl text-lg leading-8 ${dark ? 'text-white/68' : 'text-slate-600'}`}>Compare velocidades, valores e beneficios usando o visual escolhido no admin.</p>
            </div>
            <div className={`grid gap-3 rounded-lg p-4 sm:grid-cols-2 ${dark ? 'bg-white/[0.07] ring-1 ring-white/10' : 'bg-white shadow-sm ring-1 ring-slate-200'}`}>
              <div className="flex items-center gap-2 text-sm font-black" style={{ color: dark ? theme.secondary : theme.primary }}><SlidersHorizontal size={17} /> Filtros</div>
              <div className="hidden sm:block" />
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Todos os tipos</option>
                <option value="residencial">Residencial</option>
                <option value="empresarial">Empresarial</option>
                <option value="dedicado">Dedicado</option>
              </Select>
              <Select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Destaque</option>
                <option value="price">Menor preco</option>
                <option value="speed">Maior velocidade</option>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {isLoading ? <div className="mt-8"><Loading /></div> : (
          <div className="motion-stagger grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data?.data?.map((plan: any) => <ThemedPlanCard key={plan.id} plan={plan} theme={theme} template={template} whatsapp={company?.whatsapp} message={siteSettings?.whatsappContractMessage} />)}
          </div>
        )}
      </section>
    </main>
  );
}
