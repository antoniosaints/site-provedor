import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, Headphones, ShieldCheck, Zap } from 'lucide-react';
import { api, assetUrl } from '../../lib/api';
import { readableDate } from '../../lib/format';
import { ButtonLink } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Status';
import { PlanCard } from '../../components/public/PlanCard';
import { Seo } from '../../components/public/Seo';
import { HeroCarousel } from '../../components/public/HeroCarousel';
import { TestimonialsSection } from '../../components/public/TestimonialsSection';

export function HomePage() {
  const { data, isLoading } = useQuery({ queryKey: ['home'], queryFn: () => api.get<any>('/api/public/home') });
  if (isLoading) return <main className="mx-auto max-w-7xl px-4 py-10"><Loading /></main>;

  const company = data?.company;
  const settings = data?.settings;
  const mvv = data?.missionVisionValues;
  const companyName = company?.companyName ?? settings?.siteTitle ?? 'MEGANET';

  return (
    <main>
      <Seo title={`${settings?.siteTitle ?? companyName} | Internet fibra optica`} description={settings?.seoDescription} />
      <HeroCarousel banners={data?.banners} companyName={companyName} featureBandItems={data?.featureHighlights ?? settings?.carouselFeatureBandItems} />

      <section className="motion-reveal mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-bold text-brand-700">Planos em destaque</p>
            <h2 className="font-display text-3xl font-bold text-brand-900">Escolha uma conexao a altura da sua rotina</h2>
          </div>
          <ButtonLink href="/planos" variant="secondary">Todos os planos</ButtonLink>
        </div>
        <div className="motion-stagger mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data?.plans?.map((plan: any) => <PlanCard key={plan.id} plan={plan} whatsapp={company?.whatsapp} message={settings?.whatsappContractMessage} />)}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="motion-stagger mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            [Zap, 'Velocidade real', 'Planos para streaming, jogos, trabalho e sistemas empresariais.'],
            [ShieldCheck, 'Estabilidade', 'Rede estruturada para reduzir quedas e oscilacoes.'],
            [Headphones, 'Atendimento proximo', 'Suporte com gente que conhece a regiao e resolve.'],
            [Building2, 'Casa e empresa', 'Solucoes residenciais, empresariais e link dedicado.']
          ].map(([Icon, title, text]) => (
            <Card key={String(title)} className="p-5">
              <Icon className="motion-icon text-brand-600" size={28} />
              <h3 className="mt-4 font-display text-lg font-bold text-brand-900">{String(title)}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{String(text)}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="motion-reveal mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="font-bold text-brand-700">{companyName}</p>
          <h2 className="font-display text-3xl font-bold text-brand-900">{company?.aboutTitle}</h2>
          <p className="mt-4 leading-7 text-slate-600">{company?.aboutText}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Card className="p-4"><strong className="tabular-nums text-2xl text-brand-700">{company?.yearsInBusiness ?? 8}+</strong><p className="text-sm text-slate-500">anos</p></Card>
            <Card className="p-4"><strong className="tabular-nums text-2xl text-brand-700">{company?.customerCount ?? 4200}+</strong><p className="text-sm text-slate-500">clientes</p></Card>
            <Card className="p-4"><strong className="tabular-nums text-2xl text-brand-700">24h</strong><p className="text-sm text-slate-500">rede monitorada</p></Card>
          </div>
        </div>
        <Card className="p-6">
          <h3 className="font-display text-xl font-bold text-brand-900">Missao, visao e valores</h3>
          <div className="motion-stagger mt-5 grid gap-4">
            <p><strong>Missao:</strong> {mvv?.mission}</p>
            <p><strong>Visao:</strong> {mvv?.vision}</p>
            <p><strong>Valores:</strong> {mvv?.values}</p>
          </div>
        </Card>
      </section>

      <TestimonialsSection testimonials={data?.testimonials} companyName={companyName} logoUrl={settings?.logoUrl} />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-bold text-brand-700">Blog</p>
            <h2 className="font-display text-3xl font-bold text-brand-900">Conteudos recentes</h2>
          </div>
          <ButtonLink href="/blog" variant="secondary">Ver blog</ButtonLink>
        </div>
        <div className="motion-stagger mt-8 grid gap-5 md:grid-cols-3">
          {data?.posts?.map((post: any) => (
            <Link to={`/blog/${post.slug}`} key={post.id}>
              <Card className="h-full overflow-hidden">
                <div className="h-36 bg-brand-50">{post.coverImageUrl ? <img src={assetUrl(post.coverImageUrl)} alt="" className="h-full w-full object-cover" /> : null}</div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase text-brand-700">{readableDate(post.publishedAt)}</p>
                  <h3 className="mt-2 font-display text-lg font-bold text-brand-900">{post.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{post.summary}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
