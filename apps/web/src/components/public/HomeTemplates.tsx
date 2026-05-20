import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Headphones,
  MapPinned,
  MessageCircle,
  Newspaper,
  Orbit,
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
import { ButtonLink } from '../ui/Button';
import { Card } from '../ui/Card';
import { Seo } from './Seo';

type HomeTemplateProps = {
  data: any;
  companyName: string;
};

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

function HubPlanCard({ plan, whatsapp, message }: { plan: any; whatsapp?: string | null; message?: string | null }) {
  return (
    <article className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-brand-50 px-2 py-1 text-[11px] font-extrabold uppercase text-brand-700">{plan.type}</span>
          {plan.featured ? <span className="rounded-md bg-signal/10 px-2 py-1 text-[11px] font-extrabold uppercase text-signal">Recomendado</span> : null}
        </div>
        <h3 className="mt-3 font-display text-2xl font-bold text-brand-900">{plan.name}</h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{plan.description}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
          {planBenefits(plan).map((benefit: string) => <span key={benefit} className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-signal" /> {benefit}</span>)}
        </div>
      </div>
      <div className="grid gap-3 sm:min-w-52">
        <div className="rounded-lg bg-slate-950 px-4 py-3 text-white">
          <p className="text-xs font-bold uppercase text-white/60">Download</p>
          <p className="font-display text-4xl font-black">{plan.downloadMbps}<span className="text-base font-bold text-white/65"> Mega</span></p>
          <p className="mt-1 text-lg font-black text-signal">{formatMoney(plan.priceCents)}<span className="text-xs text-white/65">/mes</span></p>
        </div>
        <ButtonLink href={whatsappLink(whatsapp, `${message ?? 'Ola! Quero contratar'} ${plan.name}`)} target="_blank" rel="noreferrer">
          Contratar <ArrowRight size={16} />
        </ButtonLink>
      </div>
    </article>
  );
}

function OrbitPlanCard({ plan, whatsapp, message, index }: { plan: any; whatsapp?: string | null; message?: string | null; index: number }) {
  return (
    <article className={`relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.07] p-5 text-white shadow-2xl backdrop-blur ${index === 1 ? 'lg:-translate-y-5' : ''}`}>
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-signal/20 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-extrabold uppercase text-white/75">{plan.type}</span>
          {plan.featured ? <Star size={18} fill="currentColor" className="text-signal" /> : null}
        </div>
        <h3 className="mt-5 font-display text-2xl font-bold">{plan.name}</h3>
        <div className="mt-5 flex items-end gap-2">
          <span className="font-display text-6xl font-black leading-none">{plan.downloadMbps}</span>
          <span className="pb-2 text-sm font-bold uppercase text-white/55">Mega</span>
        </div>
        <p className="mt-4 text-2xl font-black text-signal">{formatMoney(plan.priceCents)}<span className="text-sm text-white/55">/mes</span></p>
        <p className="mt-4 min-h-16 text-sm leading-6 text-white/68">{plan.description}</p>
        <div className="mt-5 grid gap-2">
          {planBenefits(plan).map((benefit: string) => <span key={benefit} className="flex items-center gap-2 text-sm font-semibold text-white/82"><CheckCircle2 size={16} className="text-signal" /> {benefit}</span>)}
        </div>
        <ButtonLink className="mt-6 w-full bg-white text-brand-900 hover:bg-brand-50" href={whatsappLink(whatsapp, `${message ?? 'Ola! Quero contratar'} ${plan.name}`)} target="_blank" rel="noreferrer">
          Ativar conexao
        </ButtonLink>
      </div>
    </article>
  );
}

export function HubHomeTemplate({ data, companyName }: HomeTemplateProps) {
  const slide = firstSlide(data);
  const company = data?.company;
  const settings = data?.settings;
  const plans = data?.plans ?? [];
  const posts = data?.posts ?? [];
  const featureItems = highlights(data).slice(0, 6);
  const primaryPlan = plans[0];

  return (
    <main className="bg-[#f4f8fb] text-slate-950">
      {templateSeo(data, companyName)}

      <section className="relative overflow-hidden bg-[#071522] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,119,200,.35),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(32,199,165,.34),transparent_28%)]" />
        <div className="relative mx-auto grid min-h-[640px] max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
          <div className="self-center">
            <span className="inline-flex rounded-md bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-signal ring-1 ring-white/15">Hub regional de fibra</span>
            <h1 className="mt-6 max-w-3xl font-display text-5xl font-black leading-none text-white sm:text-7xl">{slide.title}</h1>
            {slide.subtitle ? <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-white/75">{slide.subtitle}</p> : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={slide.buttonLink ?? '/planos'}>{slide.buttonText ?? 'Ver planos'}</ButtonLink>
              <ButtonLink href="/cobertura" variant="secondary"><MapPinned size={17} /> Consultar cobertura</ButtonLink>
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
                    <span className="font-display text-6xl font-black text-signal">{primaryPlan?.downloadMbps ?? '100%'}</span>
                    {primaryPlan ? <span className="pb-2 text-sm font-bold uppercase text-white/55">Mega</span> : null}
                  </div>
                </div>
                <div className="min-h-64 bg-brand-700/20">
                  {slide.imageUrl ? <img src={assetUrl(slide.imageUrl)} alt="" className="h-full w-full object-cover" /> : (
                    <div className="grid h-full place-items-center bg-[linear-gradient(135deg,rgba(8,119,200,.45),rgba(32,199,165,.2))]">
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
                      <Icon size={24} className="text-signal" />
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
          <div className="rounded-lg bg-brand-700 p-6 text-white">
            <p className="font-black text-signal">Planos em destaque</p>
            <h2 className="mt-3 font-display text-3xl font-black">Velocidade para casa, empresa e operacao critica.</h2>
            <p className="mt-4 text-sm leading-6 text-white/75">Escolha a conexao, consulte cobertura e siga direto para atendimento.</p>
            <ButtonLink href="/planos" className="mt-6 bg-white text-brand-900 hover:bg-brand-50">Todos os planos</ButtonLink>
          </div>
          <div className="grid gap-4">
            {plans.slice(0, 3).map((plan: any) => <HubPlanCard key={plan.id} plan={plan} whatsapp={company?.whatsapp} message={settings?.whatsappContractMessage} />)}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-black text-brand-700">Seu hub de servicos</p>
              <h2 className="mt-2 font-display text-3xl font-black text-brand-900">Tudo que o assinante procura, em poucos cliques.</h2>
            </div>
            {company?.phone ? <a className="flex items-center gap-2 text-sm font-black text-brand-700" href={`tel:${String(company.phone).replace(/\D/g, '')}`}><Phone size={17} /> {company.phone}</a> : null}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {serviceLinks(data).map(({ title, text, href, Icon, external }) => (
              <a key={title} href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="group rounded-lg border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:border-brand-100 hover:bg-white hover:shadow-soft">
                <Icon size={28} className="text-brand-700" />
                <h3 className="mt-5 font-display text-lg font-black text-brand-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                <ArrowRight className="mt-5 text-signal transition group-hover:translate-x-1" size={18} />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="font-black text-brand-700">{companyName}</p>
          <h2 className="mt-2 font-display text-3xl font-black text-brand-900">{company?.aboutTitle}</h2>
          <p className="mt-4 leading-7 text-slate-600">{company?.aboutText}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5"><strong className="tabular-nums text-3xl text-brand-700">{company?.yearsInBusiness ?? 8}+</strong><p className="mt-2 text-sm font-bold text-slate-500">anos de atuacao</p></Card>
          <Card className="p-5"><strong className="tabular-nums text-3xl text-brand-700">{company?.customerCount ?? 4200}+</strong><p className="mt-2 text-sm font-bold text-slate-500">clientes conectados</p></Card>
          <Card className="p-5"><strong className="tabular-nums text-3xl text-brand-700">24h</strong><p className="mt-2 text-sm font-bold text-slate-500">rede monitorada</p></Card>
        </div>
      </section>

      {posts.length ? (
        <section className="bg-slate-950 py-14 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-black text-signal">Noticias e dicas</p>
                <h2 className="mt-2 font-display text-3xl font-black">Conteudos recentes</h2>
              </div>
              <ButtonLink href="/blog" variant="secondary">Ver blog</ButtonLink>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {posts.slice(0, 3).map((post: any) => (
                <Link to={`/blog/${post.slug}`} key={post.id} className="rounded-lg bg-white/8 p-5 ring-1 ring-white/10 transition hover:bg-white/12">
                  <Newspaper className="text-signal" size={24} />
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
  const plans = data?.plans ?? [];
  const posts = data?.posts ?? [];
  const testimonials = data?.testimonials ?? [];
  const featureItems = highlights(data).slice(0, 5);

  return (
    <main className="overflow-hidden bg-slate-950 text-white">
      {templateSeo(data, companyName)}

      <section className="relative min-h-[720px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(8,119,200,.52),transparent_27%),radial-gradient(circle_at_78%_12%,rgba(32,199,165,.32),transparent_28%),linear-gradient(145deg,#020617_0%,#071426_54%,#042f4b_100%)]" />
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:min-h-[720px] lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-20">
          <div className="self-center">
            <span className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-signal ring-1 ring-white/15"><Orbit size={15} /> Orbit fibra</span>
            <h1 className="mt-7 max-w-4xl font-display text-5xl font-black leading-none sm:text-7xl">{slide.title}</h1>
            {slide.subtitle ? <p className="mt-7 max-w-2xl text-lg font-semibold leading-8 text-white/70">{slide.subtitle}</p> : null}
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href={slide.buttonLink ?? '/planos'} className="bg-signal text-slate-950 hover:bg-white">{slide.buttonText ?? 'Ver planos'}</ButtonLink>
              <ButtonLink href={whatsappLink(company?.whatsapp, settings?.whatsappContractMessage)} target="_blank" rel="noreferrer" className="bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/16">WhatsApp</ButtonLink>
            </div>
          </div>

          <div className="relative self-center">
            <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
            <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-signal/25" />
            <div className="relative mx-auto grid h-[28rem] max-w-md place-items-center rounded-full bg-white/[0.06] ring-1 ring-white/10 backdrop-blur">
              {slide.imageUrl ? <img src={assetUrl(slide.imageUrl)} alt="" className="h-full w-full rounded-full object-cover p-4" /> : (
                <div className="grid h-64 w-64 place-items-center rounded-full bg-brand-600/25 ring-1 ring-white/15">
                  <Wifi size={112} className="text-white" />
                </div>
              )}
              <div className="absolute -bottom-2 left-6 rounded-lg bg-white p-4 text-slate-950 shadow-2xl">
                <p className="text-xs font-black uppercase text-slate-500">Planos ate</p>
                <p className="font-display text-4xl font-black text-brand-900">{Math.max(...plans.map((plan: any) => Number(plan.downloadMbps) || 0), 0) || 600}<span className="text-sm"> Mega</span></p>
              </div>
              <div className="absolute right-0 top-8 rounded-lg bg-signal p-4 text-slate-950 shadow-2xl">
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
                <Icon size={22} className="text-signal" />
                <span className="text-sm font-black">{item.title}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-black text-signal">Planos de alta performance</p>
          <h2 className="mt-2 font-display text-4xl font-black">Escolha sua rota de velocidade.</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {plans.slice(0, 3).map((plan: any, index: number) => <OrbitPlanCard key={plan.id} plan={plan} index={index} whatsapp={company?.whatsapp} message={settings?.whatsappContractMessage} />)}
        </div>
      </section>

      <section className="bg-white py-16 text-slate-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="font-black text-brand-700">{companyName}</p>
            <h2 className="mt-2 font-display text-4xl font-black text-brand-900">{company?.aboutTitle}</h2>
            <p className="mt-5 leading-7 text-slate-600">{company?.aboutText}</p>
            <ButtonLink href="/sobre" className="mt-7">Conhecer estrutura</ButtonLink>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              [Zap, `${company?.yearsInBusiness ?? 8}+`, 'anos conectando a regiao'],
              [ShieldCheck, `${company?.customerCount ?? 4200}+`, 'clientes atendidos'],
              [Headphones, '24h', 'rede monitorada']
            ].map(([Icon, value, text]) => (
              <div key={String(text)} className="rounded-lg bg-slate-50 p-5 ring-1 ring-slate-200">
                <Icon className="text-brand-700" size={27} />
                <p className="mt-6 font-display text-4xl font-black text-brand-900">{String(value)}</p>
                <p className="mt-2 text-sm font-bold leading-5 text-slate-500">{String(text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {testimonials.length ? (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="font-black text-signal">Experiencias reais</p>
            <h2 className="mt-2 font-display text-4xl font-black">Quem usa sente a diferenca.</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {testimonials.slice(0, 3).map((item: any) => (
                <article key={item.id} className="rounded-lg bg-white/[0.07] p-6 ring-1 ring-white/10">
                  <Sparkles className="text-signal" size={24} />
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
                <p className="font-black text-signal">Radar digital</p>
                <h2 className="mt-2 font-display text-4xl font-black">Novidades da rede.</h2>
              </div>
              <ButtonLink href="/blog" variant="secondary">Ver blog</ButtonLink>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {posts.slice(0, 3).map((post: any) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="group overflow-hidden rounded-lg bg-white text-slate-950">
                  <div className="h-40 bg-brand-50">
                    {post.coverImageUrl ? <img src={assetUrl(post.coverImageUrl)} alt="" className="h-full w-full object-cover transition group-hover:scale-105" /> : null}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-black uppercase text-brand-700">{readableDate(post.publishedAt)}</p>
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
