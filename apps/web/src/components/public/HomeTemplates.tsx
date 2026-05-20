import { Link } from 'react-router-dom';
import type { CSSProperties, ReactNode } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Headphones,
  MapPinned,
  MessageCircle,
  Newspaper,
  Phone,
  Rocket,
  ShieldCheck,
  Signal,
  Sparkles,
  Star,
  Wifi,
  Zap
} from 'lucide-react';
import { assetUrl } from '../../lib/api';
import { formatMoney, readableDate, whatsappLink } from '../../lib/format';
import { getHighlightIcon } from '../../lib/highlight-icons';
import { Card } from '../ui/Card';
import { Seo } from './Seo';

type HomeTemplateProps = {
  data: any;
  companyName: string;
};

type TemplateTheme = {
  primary: string;
  secondary: string;
  primaryText: string;
  secondaryText: string;
  primaryRgb: string;
  secondaryRgb: string;
};

function normalizeHex(value: unknown, fallback: string) {
  const color = String(value ?? '').trim();
  if (/^#[0-9a-fA-F]{3}$/.test(color)) {
    return `#${color.slice(1).split('').map((digit) => digit + digit).join('')}`;
  }
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
  return fallback;
}

function hexToRgb(color: string) {
  const hex = normalizeHex(color, '#0877c8').slice(1);
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16)
  ] as const;
}

function readableText(color: string) {
  const [r, g, b] = hexToRgb(color);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#102133' : '#ffffff';
}

function themeFromSettings(settings: any): TemplateTheme {
  const primary = normalizeHex(settings?.primaryColor, '#0877c8');
  const secondary = normalizeHex(settings?.secondaryColor, '#20c7a5');
  const primaryRgb = hexToRgb(primary).join(' ');
  const secondaryRgb = hexToRgb(secondary).join(' ');

  return {
    primary,
    secondary,
    primaryText: readableText(primary),
    secondaryText: readableText(secondary),
    primaryRgb,
    secondaryRgb
  };
}

function alpha(rgb: string, opacity: number) {
  return `rgb(${rgb} / ${opacity})`;
}

function templateVars(theme: TemplateTheme): CSSProperties {
  return {
    '--site-primary': theme.primary,
    '--site-secondary': theme.secondary,
    '--site-primary-rgb': theme.primaryRgb,
    '--site-secondary-rgb': theme.secondaryRgb
  } as CSSProperties;
}

function buttonStyle(theme: TemplateTheme, variant: 'primary' | 'secondary' | 'accent' | 'dark' = 'primary'): CSSProperties {
  if (variant === 'secondary') {
    return {
      backgroundColor: '#ffffff',
      borderColor: alpha(theme.primaryRgb, 0.22),
      color: theme.primary
    };
  }

  if (variant === 'accent') {
    return {
      backgroundColor: theme.secondary,
      borderColor: theme.secondary,
      color: theme.secondaryText
    };
  }

  if (variant === 'dark') {
    return {
      backgroundColor: alpha(theme.primaryRgb, 0.18),
      borderColor: alpha(theme.primaryRgb, 0.34),
      color: '#ffffff'
    };
  }

  return {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
    color: theme.primaryText
  };
}

function ThemedLink({
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

function firstSlide(data: any) {
  return data?.banners?.[0] ?? {
    title: 'Internet fibra para ir mais longe',
    subtitle: data?.company?.shortDescription,
    buttonText: 'Ver planos',
    buttonLink: '/planos',
    imageUrl: null,
    highlights: []
  };
}

function templateSeo(data: any, companyName: string) {
  return <Seo title={`${data?.settings?.siteTitle ?? companyName} | Internet fibra optica`} description={data?.settings?.seoDescription} />;
}

function highlights(data: any) {
  const featureHighlights = Array.isArray(data?.featureHighlights) ? data.featureHighlights : [];
  if (featureHighlights.length) return featureHighlights;

  return [
    { id: 'speed', title: 'Fibra optica', icon: 'Zap' },
    { id: 'support', title: 'Suporte proximo', icon: 'Headphones' },
    { id: 'stability', title: 'Rede monitorada', icon: 'ShieldCheck' }
  ];
}

function planBenefits(plan: any) {
  return Array.isArray(plan?.benefits) ? plan.benefits.slice(0, 3) : [];
}

function serviceLinks(data: any) {
  const settings = data?.settings;
  const company = data?.company;
  const subscriberCenterUrl = String(settings?.subscriberCenterUrl ?? '').trim();
  const careersUrl = String(settings?.careersUrl ?? '').trim();

  return [
    { title: 'Consultar cobertura', text: 'Confira disponibilidade na sua regiao.', href: '/cobertura', Icon: MapPinned },
    { title: 'Falar no WhatsApp', text: 'Atendimento rapido para contratar ou tirar duvidas.', href: whatsappLink(company?.whatsapp, settings?.whatsappContractMessage), Icon: MessageCircle, external: true },
    ...(subscriberCenterUrl ? [{ title: 'Central do assinante', text: 'Acesse boletos, suporte e sua conta.', href: subscriberCenterUrl, Icon: Wifi, external: true }] : []),
    ...(careersUrl ? [{ title: 'Trabalhe conosco', text: 'Veja oportunidades abertas.', href: careersUrl, Icon: Building2, external: true }] : [])
  ];
}

function HubPlanCard({ plan, whatsapp, message, theme }: { plan: any; whatsapp?: string | null; message?: string | null; theme: TemplateTheme }) {
  return (
    <article className="grid gap-4 rounded-lg border bg-white p-5 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center" style={{ borderColor: alpha(theme.primaryRgb, 0.14) }}>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md px-2 py-1 text-[11px] font-extrabold uppercase" style={{ backgroundColor: alpha(theme.primaryRgb, 0.1), color: theme.primary }}>{plan.type}</span>
          {plan.featured ? <span className="rounded-md px-2 py-1 text-[11px] font-extrabold uppercase" style={{ backgroundColor: alpha(theme.secondaryRgb, 0.14), color: theme.secondary }}>Recomendado</span> : null}
        </div>
        <h3 className="mt-3 font-display text-2xl font-bold text-brand-900">{plan.name}</h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{plan.description}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
          {planBenefits(plan).map((benefit: string) => <span key={benefit} className="flex items-center gap-1.5"><CheckCircle2 size={15} style={{ color: theme.secondary }} /> {benefit}</span>)}
        </div>
      </div>
      <div className="grid gap-3 sm:min-w-52">
        <div className="rounded-lg px-4 py-3 text-white" style={{ backgroundColor: theme.primary }}>
          <p className="text-xs font-bold uppercase text-white/60">Download</p>
          <p className="font-display text-4xl font-black">{plan.downloadMbps}<span className="text-base font-bold text-white/65"> Mega</span></p>
          <p className="mt-1 text-lg font-black" style={{ color: theme.secondary }}>{formatMoney(plan.priceCents)}<span className="text-xs text-white/65">/mes</span></p>
        </div>
        <ThemedLink href={whatsappLink(whatsapp, `${message ?? 'Ola! Quero contratar'} ${plan.name}`)} theme={theme} external>
          Contratar <ArrowRight size={16} />
        </ThemedLink>
      </div>
    </article>
  );
}

function OrbitPlanCard({ plan, whatsapp, message, index, theme }: { plan: any; whatsapp?: string | null; message?: string | null; index: number; theme: TemplateTheme }) {
  return (
    <article className={`relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.07] p-5 text-white shadow-2xl backdrop-blur ${index === 1 ? 'lg:-translate-y-5' : ''}`} style={{ boxShadow: `0 24px 80px ${alpha(theme.primaryRgb, 0.18)}` }}>
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl" style={{ backgroundColor: alpha(theme.secondaryRgb, 0.22) }} />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-extrabold uppercase text-white/75">{plan.type}</span>
          {plan.featured ? <Star size={18} fill="currentColor" style={{ color: theme.secondary }} /> : null}
        </div>
        <h3 className="mt-5 font-display text-2xl font-bold">{plan.name}</h3>
        <div className="mt-5 flex items-end gap-2">
          <span className="font-display text-6xl font-black leading-none">{plan.downloadMbps}</span>
          <span className="pb-2 text-sm font-bold uppercase text-white/55">Mega</span>
        </div>
        <p className="mt-4 text-2xl font-black" style={{ color: theme.secondary }}>{formatMoney(plan.priceCents)}<span className="text-sm text-white/55">/mes</span></p>
        <p className="mt-4 min-h-16 text-sm leading-6 text-white/68">{plan.description}</p>
        <div className="mt-5 grid gap-2">
          {planBenefits(plan).map((benefit: string) => <span key={benefit} className="flex items-center gap-2 text-sm font-semibold text-white/82"><CheckCircle2 size={16} style={{ color: theme.secondary }} /> {benefit}</span>)}
        </div>
        <ThemedLink className="mt-6 w-full" href={whatsappLink(whatsapp, `${message ?? 'Ola! Quero contratar'} ${plan.name}`)} theme={theme} variant="accent" external>
          Ativar conexao
        </ThemedLink>
      </div>
    </article>
  );
}

export function HubHomeTemplate({ data, companyName }: HomeTemplateProps) {
  const slide = firstSlide(data);
  const company = data?.company;
  const settings = data?.settings;
  const theme = themeFromSettings(settings);
  const plans = data?.plans ?? [];
  const posts = data?.posts ?? [];
  const featureItems = highlights(data).slice(0, 6);
  const primaryPlan = plans[0];

  return (
    <main className="bg-[#f4f8fb] text-slate-950" style={templateVars(theme)}>
      {templateSeo(data, companyName)}

      <section className="relative overflow-hidden bg-[#071522] text-white">
        <div className="absolute inset-0" style={{ background: `linear-gradient(120deg,${alpha(theme.primaryRgb, 0.38)},transparent 45%),radial-gradient(circle at 80% 20%,${alpha(theme.secondaryRgb, 0.34)},transparent 28%)` }} />
        <div className="relative mx-auto grid min-h-[640px] max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
          <div className="self-center">
            <span className="inline-flex rounded-md bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] ring-1 ring-white/15" style={{ color: theme.secondary }}>Fibra optica {companyName}</span>
            <h1 className="mt-6 max-w-3xl font-display text-5xl font-black leading-none text-white sm:text-7xl">{slide.title}</h1>
            {slide.subtitle ? <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-white/75">{slide.subtitle}</p> : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <ThemedLink href={slide.buttonLink ?? '/planos'} theme={theme}>{slide.buttonText ?? 'Ver planos'}</ThemedLink>
              <ThemedLink href="/cobertura" theme={theme} variant="secondary"><MapPinned size={17} /> Consultar cobertura</ThemedLink>
            </div>
          </div>

          <div className="relative self-center">
            <div className="grid gap-4 rounded-lg border border-white/12 bg-white/8 p-4 backdrop-blur">
              <div className="grid overflow-hidden rounded-lg bg-slate-950/80 sm:grid-cols-[1fr_0.9fr]">
                <div className="p-6">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">Conexao em destaque</p>
                  <h2 className="mt-4 font-display text-3xl font-black">{primaryPlan?.name ?? companyName}</h2>
                  <p className="mt-3 text-sm leading-6 text-white/65">{primaryPlan?.description ?? company?.shortDescription}</p>
                  <div className="mt-6 flex items-end gap-2">
                    <span className="font-display text-6xl font-black" style={{ color: theme.secondary }}>{primaryPlan?.downloadMbps ?? '100%'}</span>
                    {primaryPlan ? <span className="pb-2 text-sm font-bold uppercase text-white/55">Mega</span> : null}
                  </div>
                </div>
                <div className="min-h-64" style={{ backgroundColor: alpha(theme.primaryRgb, 0.2) }}>
                  {slide.imageUrl ? <img src={assetUrl(slide.imageUrl)} alt="" className="h-full w-full object-cover" /> : (
                    <div className="grid h-full place-items-center" style={{ background: `linear-gradient(135deg,${alpha(theme.primaryRgb, 0.45)},${alpha(theme.secondaryRgb, 0.22)})` }}>
                      <Signal size={112} className="text-white/75" />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {featureItems.slice(0, 3).map((item: any) => {
                  const Icon = getHighlightIcon(item.icon);
                  return (
                    <div key={item.id ?? item.title} className="rounded-lg bg-white/10 p-4 ring-1 ring-white/10">
                      <Icon size={24} style={{ color: theme.secondary }} />
                      <p className="mt-3 text-sm font-black">{item.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-lg p-6 text-white" style={{ backgroundColor: theme.primary }}>
            <p className="font-black" style={{ color: theme.secondary }}>Planos em destaque</p>
            <h2 className="mt-3 font-display text-3xl font-black">Velocidade para casa, empresa e operacao critica.</h2>
            <p className="mt-4 text-sm leading-6 text-white/75">Escolha a conexao, consulte cobertura e siga direto para atendimento.</p>
            <ThemedLink href="/planos" theme={theme} variant="secondary" className="mt-6">Todos os planos</ThemedLink>
          </div>
          <div className="grid gap-4">
            {plans.slice(0, 3).map((plan: any) => <HubPlanCard key={plan.id} plan={plan} whatsapp={company?.whatsapp} message={settings?.whatsappContractMessage} theme={theme} />)}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-black" style={{ color: theme.primary }}>Servicos digitais</p>
              <h2 className="mt-2 font-display text-3xl font-black text-brand-900">Tudo que o assinante procura, em poucos cliques.</h2>
            </div>
            {company?.phone ? <a className="flex items-center gap-2 text-sm font-black" href={`tel:${String(company.phone).replace(/\D/g, '')}`} style={{ color: theme.primary }}><Phone size={17} /> {company.phone}</a> : null}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {serviceLinks(data).map(({ title, text, href, Icon, external }) => (
              <a key={title} href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="group rounded-lg border bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-soft" style={{ borderColor: alpha(theme.primaryRgb, 0.12) }}>
                <Icon size={28} style={{ color: theme.primary }} />
                <h3 className="mt-5 font-display text-lg font-black text-brand-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                <ArrowRight className="mt-5 transition group-hover:translate-x-1" size={18} style={{ color: theme.secondary }} />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="font-black" style={{ color: theme.primary }}>{companyName}</p>
          <h2 className="mt-2 font-display text-3xl font-black text-brand-900">{company?.aboutTitle}</h2>
          <p className="mt-4 leading-7 text-slate-600">{company?.aboutText}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5"><strong className="tabular-nums text-3xl" style={{ color: theme.primary }}>{company?.yearsInBusiness ?? 8}+</strong><p className="mt-2 text-sm font-bold text-slate-500">anos de atuacao</p></Card>
          <Card className="p-5"><strong className="tabular-nums text-3xl" style={{ color: theme.primary }}>{company?.customerCount ?? 4200}+</strong><p className="mt-2 text-sm font-bold text-slate-500">clientes conectados</p></Card>
          <Card className="p-5"><strong className="tabular-nums text-3xl" style={{ color: theme.primary }}>24h</strong><p className="mt-2 text-sm font-bold text-slate-500">rede monitorada</p></Card>
        </div>
      </section>

      {posts.length ? (
        <section className="bg-slate-950 py-14 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-black" style={{ color: theme.secondary }}>Noticias e dicas</p>
                <h2 className="mt-2 font-display text-3xl font-black">Conteudos recentes</h2>
              </div>
              <ThemedLink href="/blog" theme={theme} variant="secondary">Ver blog</ThemedLink>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {posts.slice(0, 3).map((post: any) => (
                <Link to={`/blog/${post.slug}`} key={post.id} className="rounded-lg bg-white/8 p-5 ring-1 ring-white/10 transition hover:bg-white/12">
                  <Newspaper size={24} style={{ color: theme.secondary }} />
                  <p className="mt-5 text-xs font-black uppercase text-white/45">{readableDate(post.publishedAt)}</p>
                  <h3 className="mt-2 font-display text-xl font-black">{post.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/65">{post.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

export function OrbitHomeTemplate({ data, companyName }: HomeTemplateProps) {
  const slide = firstSlide(data);
  const company = data?.company;
  const settings = data?.settings;
  const theme = themeFromSettings(settings);
  const plans = data?.plans ?? [];
  const posts = data?.posts ?? [];
  const testimonials = data?.testimonials ?? [];
  const featureItems = highlights(data).slice(0, 5);

  return (
    <main className="overflow-hidden bg-slate-950 text-white" style={templateVars(theme)}>
      {templateSeo(data, companyName)}

      <section className="relative min-h-[720px]">
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 20% 20%,${alpha(theme.primaryRgb, 0.52)},transparent 27%),radial-gradient(circle at 78% 12%,${alpha(theme.secondaryRgb, 0.32)},transparent 28%),linear-gradient(145deg,#020617 0%,#071426 54%,${alpha(theme.primaryRgb, 0.34)} 100%)` }} />
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:min-h-[720px] lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-20">
          <div className="self-center">
            <span className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] ring-1 ring-white/15" style={{ color: theme.secondary }}><Wifi size={15} /> Fibra optica {companyName}</span>
            <h1 className="mt-7 max-w-4xl font-display text-5xl font-black leading-none sm:text-7xl">{slide.title}</h1>
            {slide.subtitle ? <p className="mt-7 max-w-2xl text-lg font-semibold leading-8 text-white/70">{slide.subtitle}</p> : null}
            <div className="mt-9 flex flex-wrap gap-3">
              <ThemedLink href={slide.buttonLink ?? '/planos'} theme={theme} variant="accent">{slide.buttonText ?? 'Ver planos'}</ThemedLink>
              <ThemedLink href={whatsappLink(company?.whatsapp, settings?.whatsappContractMessage)} theme={theme} variant="dark" external>WhatsApp</ThemedLink>
            </div>
          </div>

          <div className="relative self-center">
            <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
            <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border" style={{ borderColor: alpha(theme.secondaryRgb, 0.28) }} />
            <div className="relative mx-auto grid h-[28rem] max-w-md place-items-center rounded-full bg-white/[0.06] ring-1 ring-white/10 backdrop-blur">
              {slide.imageUrl ? <img src={assetUrl(slide.imageUrl)} alt="" className="h-full w-full rounded-full object-cover p-4" /> : (
                <div className="grid h-64 w-64 place-items-center rounded-full ring-1 ring-white/15" style={{ backgroundColor: alpha(theme.primaryRgb, 0.25) }}>
                  <Wifi size={112} className="text-white" />
                </div>
              )}
              <div className="absolute -bottom-2 left-6 rounded-lg bg-white p-4 text-slate-950 shadow-2xl">
                <p className="text-xs font-black uppercase text-slate-500">Planos ate</p>
                <p className="font-display text-4xl font-black" style={{ color: theme.primary }}>{Math.max(...plans.map((plan: any) => Number(plan.downloadMbps) || 0), 0) || 600}<span className="text-sm"> Mega</span></p>
              </div>
              <div className="absolute right-0 top-8 rounded-lg p-4 shadow-2xl" style={{ backgroundColor: theme.secondary, color: theme.secondaryText }}>
                <Rocket size={25} />
                <p className="mt-2 text-sm font-black">Ativacao rapida</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-white/[0.04] py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-3 px-4 sm:px-6 lg:px-8">
          {featureItems.map((item: any) => {
            const Icon = getHighlightIcon(item.icon);
            return (
              <div key={item.id ?? item.title} className="flex min-w-44 items-center gap-3 rounded-lg bg-white/[0.07] px-4 py-3 ring-1 ring-white/10">
                <Icon size={22} style={{ color: theme.secondary }} />
                <span className="text-sm font-black">{item.title}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-black" style={{ color: theme.secondary }}>Planos de alta performance</p>
          <h2 className="mt-2 font-display text-4xl font-black">Escolha sua rota de velocidade.</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {plans.slice(0, 3).map((plan: any, index: number) => <OrbitPlanCard key={plan.id} plan={plan} index={index} whatsapp={company?.whatsapp} message={settings?.whatsappContractMessage} theme={theme} />)}
        </div>
      </section>

      <section className="bg-white py-16 text-slate-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="font-black" style={{ color: theme.primary }}>{companyName}</p>
            <h2 className="mt-2 font-display text-4xl font-black text-brand-900">{company?.aboutTitle}</h2>
            <p className="mt-5 leading-7 text-slate-600">{company?.aboutText}</p>
            <ThemedLink href="/sobre" theme={theme} className="mt-7">Conhecer estrutura</ThemedLink>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              [Zap, `${company?.yearsInBusiness ?? 8}+`, 'anos conectando a regiao'],
              [ShieldCheck, `${company?.customerCount ?? 4200}+`, 'clientes atendidos'],
              [Headphones, '24h', 'rede monitorada']
            ].map(([Icon, value, text]) => (
              <div key={String(text)} className="rounded-lg bg-slate-50 p-5 ring-1 ring-slate-200">
                <Icon size={27} style={{ color: theme.primary }} />
                <p className="mt-6 font-display text-4xl font-black" style={{ color: theme.primary }}>{String(value)}</p>
                <p className="mt-2 text-sm font-bold leading-5 text-slate-500">{String(text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {testimonials.length ? (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="font-black" style={{ color: theme.secondary }}>Experiencias reais</p>
            <h2 className="mt-2 font-display text-4xl font-black">Quem usa sente a diferenca.</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {testimonials.slice(0, 3).map((item: any) => (
                <article key={item.id} className="rounded-lg bg-white/[0.07] p-6 ring-1 ring-white/10">
                  <Sparkles size={24} style={{ color: theme.secondary }} />
                  <p className="mt-5 leading-7 text-white/72">"{item.text}"</p>
                  <p className="mt-6 font-black">{item.name}</p>
                  {item.location ? <p className="text-sm text-white/45">{item.location}</p> : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {posts.length ? (
        <section className="bg-[#06111f] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="font-black" style={{ color: theme.secondary }}>Radar digital</p>
                <h2 className="mt-2 font-display text-4xl font-black">Novidades da rede.</h2>
              </div>
              <ThemedLink href="/blog" theme={theme} variant="secondary">Ver blog</ThemedLink>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {posts.slice(0, 3).map((post: any) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="group overflow-hidden rounded-lg bg-white text-slate-950">
                  <div className="h-40" style={{ backgroundColor: alpha(theme.primaryRgb, 0.1) }}>
                    {post.coverImageUrl ? <img src={assetUrl(post.coverImageUrl)} alt="" className="h-full w-full object-cover transition group-hover:scale-105" /> : null}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-black uppercase" style={{ color: theme.primary }}>{readableDate(post.publishedAt)}</p>
                    <h3 className="mt-2 font-display text-xl font-black text-brand-900">{post.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{post.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
