import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, MapPinned, Wifi } from 'lucide-react';
import { assetUrl } from '../../lib/api';
import { getHighlightIcon } from '../../lib/highlight-icons';
import { hexToRgb, normalizeHex } from '../../lib/site-theme';
import { ButtonLink } from '../ui/Button';

type HeroSlide = {
    id: string;
    title: string;
    subtitle?: string | null;
    buttonText?: string | null;
    buttonLink?: string | null;
    imageUrl?: string | null;
    carouselType?: string | null;
    backgroundColor?: string | null;
    highlights?: string[];
};

type FeatureBandItem = string | {
  id?: string;
  title?: string | null;
  name?: string | null;
  icon?: string | null;
};

const fallbackFeatureBandItems: FeatureBandItem[] = [
  { title: 'Mega Fibra', icon: 'Gauge' },
  { title: 'Suporte Total', icon: 'ShieldCheck' },
  { title: 'Ponto Gamer', icon: 'Gamepad2' }
];

const fallbackFeatureIcons = ['Gauge', 'ShieldCheck', 'Gamepad2', 'Wifi', 'Router', 'Building2', 'Rocket'];

const fallbackSlides: HeroSlide[] = [
  {
    id: 'fallback',
    title: 'Internet fibra para ir mais longe',
    subtitle: 'Planos rápidos, estáveis e com suporte próximo para sua casa ou empresa.',
    buttonText: 'Ver planos',
    buttonLink: '/planos',
    imageUrl: null,
    carouselType: 'content',
    backgroundColor: '#0877c8',
    highlights: ['Maior velocidade', 'Segurança aprimorada', 'Latência reduzida', 'Mais dispositivos']
  }
];

type HeroCarouselProps = {
  banners?: HeroSlide[];
  companyName?: string;
  featureBandItems?: FeatureBandItem[];
};

function normalizeFeatureBandItems(items?: FeatureBandItem[]) {
  return (items ?? fallbackFeatureBandItems)
    .map((item, index) => {
      if (typeof item === 'string') {
        return { id: item, title: item, icon: fallbackFeatureIcons[index % fallbackFeatureIcons.length] };
      }

      const title = item.title ?? item.name ?? '';
      return {
        id: item.id ?? `${title}-${index}`,
        title,
        icon: item.icon ?? fallbackFeatureIcons[index % fallbackFeatureIcons.length]
      };
    })
    .filter((item) => item.title.trim().length > 0);
}

function rgba(color: string, opacity: number) {
  return `rgb(${hexToRgb(color).join(' ')} / ${opacity})`;
}

function mix(color: string, target: string, amount: number) {
  const sourceRgb = hexToRgb(color);
  const targetRgb = hexToRgb(target);
  const mixed = sourceRgb.map((channel, index) => Math.round(channel + ((targetRgb[index] ?? channel) - channel) * amount));
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function carouselBackground(color: unknown) {
  const base = normalizeHex(color, '#0877c8');
  const deep = mix(base, '#000000', 0.22);
  const light = mix(base, '#ffffff', 0.42);
  const accent = mix(base, '#ffffff', 0.18);

  return `radial-gradient(circle at 78% 20%,${rgba(light, 0.55)},transparent 24%),radial-gradient(circle at 8% 88%,${rgba(accent, 0.7)},transparent 28%),linear-gradient(120deg,${deep} 0%,${light} 52%,${base} 100%)`;
}

export function HeroCarousel({ banners, companyName = 'MEGANET', featureBandItems }: HeroCarouselProps) {
  const slides = useMemo(() => (banners?.length ? banners : fallbackSlides), [banners]);
  const bandItems = useMemo(() => normalizeFeatureBandItems(featureBandItems), [featureBandItems]);
  const [active, setActive] = useState(0);
  const slide = slides[active] ?? slides[0];
  const highlights = slide.highlights?.length ? slide.highlights : (fallbackSlides[0].highlights ?? []);
  const isImageOnly = slide.carouselType === 'image';

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  function go(direction: number) {
    setActive((current) => (current + direction + slides.length) % slides.length);
  }

  return (
    <section className="bg-brand-900 text-white">
      <div className="relative overflow-hidden">
      {isImageOnly && slide.imageUrl ? (
        <img src={assetUrl(slide.imageUrl)} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          <div className="absolute inset-0" style={{ background: carouselBackground(slide.backgroundColor) }} />
          <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(115deg,transparent_0%,transparent_46%,rgba(255,255,255,.28)_47%,transparent_49%),linear-gradient(105deg,transparent_0%,transparent_58%,rgba(255,255,255,.18)_59%,transparent_61%)]" />
        </>
      )}

      {slides.length > 1 ? (
        <>
          <button type="button" onClick={() => go(-1)} className="motion-press absolute left-4 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-lg bg-white/15 text-white backdrop-blur hover:bg-white/25" aria-label="Slide anterior">
            <ChevronLeft size={23} />
          </button>
          <button type="button" onClick={() => go(1)} className="motion-press absolute right-4 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-lg bg-white/15 text-white backdrop-blur hover:bg-white/25" aria-label="Próximo slide">
            <ChevronRight size={23} />
          </button>
        </>
      ) : null}

      {isImageOnly ? (
        <div key={slide.id} className="relative mx-auto min-h-[620px] max-w-7xl px-4 pb-16 pt-16" />
      ) : (
        <div className="relative mx-auto grid min-h-[620px] max-w-7xl gap-10 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-20 lg:pt-20">
          <div key={slide.id} className="motion-reveal self-center text-center lg:text-left">
            <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white ring-1 ring-white/25 backdrop-blur">
              Fibra óptica {companyName}
            </span>
            <h1 className="mx-auto mt-7 max-w-3xl font-display text-5xl font-bold leading-none tracking-normal text-white sm:text-7xl lg:mx-0">
              {slide.title}
            </h1>
            <div className="motion-stagger mx-auto mt-7 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 lg:mx-0">
              {highlights.slice(0, 4).map((highlight, index) => {
                const Icon = getHighlightIcon(fallbackFeatureIcons[index % fallbackFeatureIcons.length]);
                return (
                  <div key={highlight} className="flex items-center gap-2 rounded-lg bg-white/12 px-3 py-2 text-left text-sm font-bold leading-tight ring-1 ring-white/15 backdrop-blur">
                    <Icon className="motion-icon shrink-0 text-white" size={22} />
                    <span>{highlight}</span>
                  </div>
                );
              })}
            </div>
            {slide.subtitle ? <p className="mx-auto mt-8 max-w-2xl text-lg font-semibold leading-8 text-white/92 lg:mx-0">{slide.subtitle}</p> : null}
            <div className="mt-9 flex flex-wrap justify-center gap-3 lg:justify-start">
              <ButtonLink className="min-w-52 bg-white/12 text-brand-700 hover:bg-brand-50" href={slide.buttonLink ?? '/planos'}>
                {slide.buttonText ?? 'Assine já'}
              </ButtonLink>
              <ButtonLink className="bg-white/12 text-white ring-1 ring-white/35 hover:bg-white/20" href="/cobertura" variant="ghost">
                <MapPinned className="motion-icon" size={17} /> Consultar cobertura
              </ButtonLink>
            </div>
          </div>

          <div className="motion-float relative hidden min-h-[430px] self-end lg:block">
            {slide.imageUrl ? (
              <img src={assetUrl(slide.imageUrl)} alt="" className="absolute inset-0 h-full w-full object-contain object-bottom" />
            ) : (
              <div className="absolute bottom-8 right-0 grid h-80 w-80 place-items-center rounded-full bg-white/14 text-center ring-1 ring-white/25 backdrop-blur">
                <div>
                  <Wifi className="mx-auto text-white" size={74} />
                  <p className="mt-5 font-display text-5xl font-bold">Wi-Fi 6</p>
                  <p className="mt-2 text-sm font-bold uppercase tracking-normal text-white/75">{companyName}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {slides.length > 1 ? (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((item, index) => (
            <button key={item.id} type="button" onClick={() => setActive(index)} className={`h-3 rounded-full transition-[width,background-color] duration-200 ${index === active ? 'w-8 bg-white' : 'w-3 bg-white/45 hover:bg-white/70'}`} aria-label={`Ir para slide ${index + 1}`} />
          ))}
        </div>
      ) : null}
      </div>

      {bandItems.length ? (
        <div className="relative z-10 bg-brand-700/80 backdrop-blur">
          <div className="motion-stagger mx-auto flex max-w-7xl flex-wrap justify-center gap-x-8 gap-y-4 px-4 py-5 text-center sm:px-6 lg:px-8">
            {bandItems.map((item) => {
              const Icon = getHighlightIcon(item.icon);
              return (
                <div key={item.id} className="grid min-w-[6.5rem] max-w-[8.5rem] flex-[0_1_7.5rem] justify-items-center gap-2 text-xs font-bold text-white">
                  <Icon className="motion-icon" size={27} />
                  <span>{item.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
