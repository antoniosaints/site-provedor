import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, ShieldCheck, Users, Zap } from 'lucide-react';
import { api, assetUrl } from '../../lib/api';
import { alpha, getSiteTemplate, isDarkTemplate, templateVars, themeFromSettings } from '../../lib/site-theme';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Status';
import { Seo } from '../../components/public/Seo';

export function AboutPage() {
  const { data, isLoading } = useQuery({ queryKey: ['company'], queryFn: () => api.get<any>('/api/public/company') });
  const settings = useQuery({ queryKey: ['public-settings'], queryFn: () => api.get<any>('/api/public/settings') });
  if (isLoading) return <main className="mx-auto max-w-7xl px-4 py-12"><Loading /></main>;

  const company = data?.company;
  const mvv = data?.missionVisionValues;
  const differentials = Array.isArray(company?.differentials) ? company.differentials : [];
  const siteSettings = settings.data?.settings;
  const theme = themeFromSettings(siteSettings);
  const template = getSiteTemplate(siteSettings);
  const dark = isDarkTemplate(template);

  return (
    <main className={dark ? 'bg-slate-950 text-white' : template === 'hub' ? 'bg-[#f4f8fb] text-slate-950' : 'bg-[#f6faff] text-slate-950'} style={templateVars(theme)}>
      <Seo title="Sobre nos | MEGANET" description={company?.shortDescription} />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: dark ? `radial-gradient(circle at 16% 20%,${alpha(theme.primaryRgb, 0.4)},transparent 28%),radial-gradient(circle at 82% 18%,${alpha(theme.secondaryRgb, 0.26)},transparent 26%)` : `linear-gradient(120deg,${alpha(theme.primaryRgb, 0.12)},transparent 50%),radial-gradient(circle at 84% 20%,${alpha(theme.secondaryRgb, 0.16)},transparent 26%)` }} />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="motion-reveal self-center">
            <p className="font-bold" style={{ color: dark ? theme.secondary : theme.primary }}>Sobre nos</p>
            <h1 className={`mt-2 font-display text-5xl font-black leading-none ${dark ? 'text-white' : 'text-brand-900'}`}>{company?.aboutTitle}</h1>
            <p className={`mt-5 text-lg leading-8 ${dark ? 'text-white/70' : 'text-slate-600'}`}>{company?.aboutText}</p>
            {company?.history ? <p className={`mt-4 leading-7 ${dark ? 'text-white/62' : 'text-slate-600'}`}>{company.history}</p> : null}
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                [Zap, `${company?.yearsInBusiness ?? 8}+`, 'anos'],
                [Users, `${company?.customerCount ?? 4200}+`, 'clientes'],
                [ShieldCheck, '24h', 'monitoramento']
              ].map(([Icon, value, label]) => (
                <div key={String(label)} className={`rounded-lg p-4 ${dark ? 'bg-white/[0.07] ring-1 ring-white/10' : 'bg-white shadow-sm ring-1 ring-slate-200'}`}>
                  <Icon size={20} style={{ color: theme.secondary }} />
                  <strong className={`mt-3 block tabular-nums text-2xl ${dark ? 'text-white' : 'text-brand-900'}`}>{String(value)}</strong>
                  <p className={`text-xs font-bold uppercase ${dark ? 'text-white/48' : 'text-slate-500'}`}>{String(label)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="motion-float min-h-80 overflow-hidden rounded-lg shadow-soft" style={{ backgroundColor: alpha(theme.primaryRgb, dark ? 0.22 : 0.1) }}>
            {company?.institutionalImageUrl ? <img src={assetUrl(company.institutionalImageUrl)} alt="" className="h-full w-full object-cover" /> : (
              <div className="grid h-full min-h-80 place-items-center p-10 text-center text-white" style={{ background: `linear-gradient(135deg,${theme.primary},${theme.secondary})` }}>
                <p className="font-display text-5xl font-bold">{company?.companyName ?? 'MEGANET'}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="motion-stagger grid gap-5 md:grid-cols-3">
          {[
            ['Missao', mvv?.mission],
            ['Visao', mvv?.vision],
            ['Valores', mvv?.values]
          ].map(([title, text]) => (
            <Card key={String(title)} className={`p-6 ${dark ? 'border-white/10 bg-white/[0.07] text-white backdrop-blur' : 'bg-white'}`} style={{ borderColor: dark ? 'rgb(255 255 255 / 0.12)' : alpha(theme.primaryRgb, 0.12) }}>
              <h2 className={`font-display text-xl font-bold ${dark ? 'text-white' : 'text-brand-900'}`}>{title}</h2>
              <p className={`mt-3 leading-7 ${dark ? 'text-white/64' : 'text-slate-600'}`}>{text}</p>
            </Card>
          ))}
        </div>

        {differentials.length ? (
          <div className="mt-10">
            <h2 className={`font-display text-3xl font-bold ${dark ? 'text-white' : 'text-brand-900'}`}>Diferenciais</h2>
            <div className="motion-stagger mt-6 grid gap-3 md:grid-cols-2">
              {differentials.map((item: string) => (
                <span key={item} className={`motion-card flex gap-2 rounded-lg p-4 font-semibold shadow-sm ${dark ? 'bg-white/[0.07] text-white ring-1 ring-white/10' : 'bg-white text-slate-700'}`}>
                  <CheckCircle2 className="motion-icon shrink-0" style={{ color: theme.secondary }} /> {item}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
