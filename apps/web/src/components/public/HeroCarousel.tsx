import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MapPinned, Wifi } from "lucide-react";
import { assetUrl } from "../../lib/api";
import { getHighlightIcon } from "../../lib/highlight-icons";
import { hexToRgb, normalizeHex, readableText } from "../../lib/site-theme";
import { ButtonLink } from "../ui/Button";

type HeroSlide = {
  id: string;
  title: string;
  subtitle?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  imageUrl?: string | null;
  carouselType?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  highlights?: string[];
};

type FeatureBandItem =
  | string
  | {
      id?: string;
      title?: string | null;
      name?: string | null;
      icon?: string | null;
    };

const fallbackFeatureBandItems: FeatureBandItem[] = [
  { title: "Mega Fibra", icon: "Gauge" },
  { title: "Suporte Total", icon: "ShieldCheck" },
  { title: "Ponto Gamer", icon: "Gamepad2" },
];

const fallbackFeatureIcons = [
  "Gauge",
  "ShieldCheck",
  "Gamepad2",
  "Wifi",
  "Router",
  "Building2",
  "Rocket",
];

const fallbackSlides: HeroSlide[] = [
  {
    id: "fallback",
    title: "Internet fibra para ir mais longe",
    subtitle:
      "Planos rápidos, estáveis e com suporte próximo para sua casa ou empresa.",
    buttonText: "Ver planos",
    buttonLink: "/planos",
    imageUrl: null,
    carouselType: "content",
    backgroundColor: "#0877c8",
    textColor: "#ffffff",
    highlights: [
      "Maior velocidade",
      "Segurança aprimorada",
      "Latência reduzida",
      "Mais dispositivos",
    ],
  },
];

type HeroCarouselProps = {
  banners?: HeroSlide[];
  companyName?: string;
  featureBandItems?: FeatureBandItem[];
  primaryColor?: string | null;
};

function normalizeFeatureBandItems(items?: FeatureBandItem[]) {
  return (items ?? fallbackFeatureBandItems)
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          id: item,
          title: item,
          icon: fallbackFeatureIcons[index % fallbackFeatureIcons.length],
        };
      }

      const title = item.title ?? item.name ?? "";
      return {
        id: item.id ?? `${title}-${index}`,
        title,
        icon:
          item.icon ??
          fallbackFeatureIcons[index % fallbackFeatureIcons.length],
      };
    })
    .filter((item) => item.title.trim().length > 0);
}

function rgba(color: string, opacity: number) {
  return `rgb(${hexToRgb(color).join(" ")} / ${opacity})`;
}

function mix(color: string, target: string, amount: number) {
  const sourceRgb = hexToRgb(color);
  const targetRgb = hexToRgb(target);
  const mixed = sourceRgb.map((channel, index) =>
    Math.round(channel + ((targetRgb[index] ?? channel) - channel) * amount),
  );
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function carouselBackground(color: unknown) {
  const base = normalizeHex(color, "#0877c8");

  // Detecta luminosidade da cor base
  const lum = luminance(base);

  // Quanto mais clara a cor, menos escurece
  const darkMix = lum > 0.72 ? 0.06 : lum > 0.55 ? 0.1 : 0.18;

  // Mantém mais fidelidade da cor original
  const deep = mix(base, "#000000", darkMix);

  // Clareia de forma suave sem "lavar"
  const light = mix(base, "#ffffff", lum > 0.75 ? 0.12 : 0.24);

  // Accent mais próximo da base
  const accent = mix(base, "#ffffff", 0.08);

  return `
    radial-gradient(
      circle at 78% 20%,
      ${rgba(light, 0.35)},
      transparent 26%
    ),
    radial-gradient(
      circle at 8% 88%,
      ${rgba(accent, 0.45)},
      transparent 30%
    ),
    linear-gradient(
      120deg,
      ${deep} 0%,
      ${base} 58%,
      ${light} 100%
    )
  `;
}

/**
 * luminância relativa simples
 */
function luminance(hex: string) {
  const c = hex.replace("#", "");

  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function HeroCarousel({
  banners,
  companyName = "MEGANET",
  featureBandItems,
  primaryColor,
}: HeroCarouselProps) {
  const slides = useMemo(
    () => (banners?.length ? banners : fallbackSlides),
    [banners],
  );
  const bandItems = useMemo(
    () => normalizeFeatureBandItems(featureBandItems),
    [featureBandItems],
  );
  const [active, setActive] = useState(0);
  const slide = slides[active] ?? slides[0];
  const highlights = slide.highlights?.length
    ? slide.highlights
    : (fallbackSlides[0].highlights ?? []);
  const isImageOnly = slide.carouselType === "image";
  const slideTextColor = normalizeHex(slide.textColor, "#ffffff");
  const slideTextReadable = readableText(slideTextColor);
  const translucentTextBackground = rgba(slideTextColor, 0.12);
  const translucentTextRing = rgba(slideTextColor, 0.32);
  const subtleTextColor = rgba(slideTextColor, 0.78);
  const bandBackgroundColor = normalizeHex(primaryColor, "#0877c8");
  const bandTextColor = readableText(bandBackgroundColor);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  function go(direction: number) {
    setActive(
      (current) => (current + direction + slides.length) % slides.length,
    );
  }

  return (
    <section className="bg-brand-900 text-white">
      <div className="relative overflow-hidden">
        {isImageOnly && slide.imageUrl ? (
          <img
            src={assetUrl(slide.imageUrl)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <div
              className="absolute inset-0"
              style={{ background: carouselBackground(slide.backgroundColor) }}
            />
            <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(115deg,transparent_0%,transparent_46%,rgba(255,255,255,.28)_47%,transparent_49%),linear-gradient(105deg,transparent_0%,transparent_58%,rgba(255,255,255,.18)_59%,transparent_61%)]" />
          </>
        )}

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="motion-press absolute left-4 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-lg backdrop-blur hover:bg-white/25"
              style={{
                backgroundColor: translucentTextBackground,
                color: slideTextColor,
              }}
              aria-label="Slide anterior"
            >
              <ChevronLeft size={23} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="motion-press absolute right-4 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-lg bg-white/15 text-white backdrop-blur hover:bg-white/25"
              aria-label="Próximo slide"
            >
              <ChevronRight size={23} />
            </button>
          </>
        ) : null}

        {isImageOnly ? (
          <div
            key={slide.id}
            className="relative mx-auto min-h-[620px] max-w-7xl px-4 pb-16 pt-16"
          />
        ) : (
          <div className="relative mx-auto grid min-h-[620px] max-w-7xl gap-10 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-20 lg:pt-20">
            <div
              key={slide.id}
              className="motion-reveal self-center text-center lg:text-left"
            >
              <h1
                className="mx-auto mt-7 max-w-3xl font-display text-5xl font-bold leading-none tracking-normal sm:text-7xl lg:mx-0"
                style={{ color: slideTextColor }}
              >
                {slide.title}
              </h1>
              <div className="motion-stagger mx-auto mt-7 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 lg:mx-0">
                {highlights.slice(0, 4).map((highlight, index) => {
                  const Icon = getHighlightIcon(
                    fallbackFeatureIcons[index % fallbackFeatureIcons.length],
                  );
                  return (
                    <div
                      key={highlight}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-bold leading-tight ring-1 backdrop-blur"
                      style={{
                        backgroundColor: rgba(slideTextColor, 0.1),
                        color: slideTextColor,
                        borderColor: rgba(slideTextColor, 0.16),
                      }}
                    >
                      <Icon className="motion-icon shrink-0" size={22} />
                      <span>{highlight}</span>
                    </div>
                  );
                })}
              </div>
              {slide.subtitle ? (
                <p
                  className="mx-auto mt-8 max-w-2xl text-lg font-semibold leading-8 lg:mx-0"
                  style={{ color: rgba(slideTextColor, 0.92) }}
                >
                  {slide.subtitle}
                </p>
              ) : null}
              <div className="mt-9 flex flex-wrap justify-center gap-3 lg:justify-start">
                <ButtonLink
                  className="min-w-52 hover:opacity-90"
                  style={{
                    backgroundColor: slideTextColor,
                    color: slideTextReadable,
                  }}
                  href={slide.buttonLink ?? "/planos"}
                >
                  {slide.buttonText ?? "Assine já"}
                </ButtonLink>
                <ButtonLink
                  className="ring-1 hover:bg-white/20"
                  style={{
                    backgroundColor: translucentTextBackground,
                    color: slideTextColor,
                    boxShadow: `inset 0 0 0 1px ${translucentTextRing}`,
                  }}
                  href="/cobertura"
                  variant="ghost"
                >
                  <MapPinned className="motion-icon" size={17} /> Consultar
                  cobertura
                </ButtonLink>
              </div>
            </div>

            <div className="motion-float relative hidden min-h-[430px] self-end lg:block">
              {slide.imageUrl ? (
                <img
                  src={assetUrl(slide.imageUrl)}
                  alt=""
                  className="absolute inset-0 h-full w-full object-contain object-bottom"
                />
              ) : (
                <div
                  className="absolute bottom-8 right-0 grid h-80 w-80 place-items-center rounded-full text-center ring-1 backdrop-blur"
                  style={{
                    backgroundColor: translucentTextBackground,
                    color: slideTextColor,
                    borderColor: translucentTextRing,
                  }}
                >
                  <div>
                    <Wifi className="mx-auto" size={74} />
                    <p className="mt-5 font-display text-5xl font-bold">
                      Wi-Fi 6
                    </p>
                    <p
                      className="mt-2 text-sm font-bold uppercase tracking-normal"
                      style={{ color: subtleTextColor }}
                    >
                      {companyName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {slides.length > 1 ? (
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(index)}
                className={`h-3 rounded-full transition-[width,background-color] duration-200 ${index === active ? "w-8" : "w-3 hover:bg-white/70"}`}
                style={{
                  backgroundColor:
                    index === active
                      ? slideTextColor
                      : rgba(slideTextColor, 0.45),
                }}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        ) : null}
      </div>

      {bandItems.length ? (
        <div className="relative z-10 backdrop-blur" style={{ backgroundColor: bandBackgroundColor, color: bandTextColor }}>
          <div className="motion-stagger mx-auto flex max-w-7xl flex-wrap justify-center gap-x-8 gap-y-4 px-4 py-5 text-center sm:px-6 lg:px-8">
            {bandItems.map((item) => {
              const Icon = getHighlightIcon(item.icon);
              return (
                <div
                  key={item.id}
                  className="grid min-w-[6.5rem] max-w-[8.5rem] flex-[0_1_7.5rem] justify-items-center gap-2 text-xs font-bold"
                >
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
