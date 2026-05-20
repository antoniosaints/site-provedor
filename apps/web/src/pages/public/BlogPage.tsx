import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Newspaper } from 'lucide-react';
import { api, assetUrl } from '../../lib/api';
import { readableDate } from '../../lib/format';
import { alpha, getSiteTemplate, isDarkTemplate, templateVars, themeFromSettings } from '../../lib/site-theme';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Status';
import { Seo } from '../../components/public/Seo';

export function BlogPage() {
  const { data, isLoading } = useQuery({ queryKey: ['blog'], queryFn: () => api.get<any>('/api/public/blog/posts') });
  const settings = useQuery({ queryKey: ['public-settings'], queryFn: () => api.get<any>('/api/public/settings') });
  const siteSettings = settings.data?.settings;
  const theme = themeFromSettings(siteSettings);
  const template = getSiteTemplate(siteSettings);
  const dark = isDarkTemplate(template);
  const posts = data?.data ?? [];

  return (
    <main className={dark ? 'bg-slate-950 text-white' : template === 'hub' ? 'bg-[#f4f8fb] text-slate-950' : 'bg-[#f6faff] text-slate-950'} style={templateVars(theme)}>
      <Seo title="Blog | MEGANET" description="Dicas de internet, Wi-Fi, seguranca digital e tecnologia." />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: dark ? `radial-gradient(circle at 20% 18%,${alpha(theme.primaryRgb, 0.38)},transparent 28%),radial-gradient(circle at 80% 12%,${alpha(theme.secondaryRgb, 0.24)},transparent 26%)` : `linear-gradient(120deg,${alpha(theme.primaryRgb, template === 'hub' ? 0.14 : 0.08)},transparent 52%),radial-gradient(circle at 84% 10%,${alpha(theme.secondaryRgb, 0.16)},transparent 26%)` }} />
        <div className="motion-reveal relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-black uppercase tracking-[0.16em]" style={{ backgroundColor: dark ? 'rgb(255 255 255 / 0.08)' : alpha(theme.primaryRgb, 0.1), color: dark ? theme.secondary : theme.primary }}>
            <Newspaper size={15} /> Blog
          </span>
          <h1 className={`mt-5 max-w-4xl font-display text-5xl font-black leading-none ${dark ? 'text-white' : 'text-brand-900'}`}>Dicas e novidades para ficar melhor conectado</h1>
          <p className={`mt-5 max-w-2xl text-lg leading-8 ${dark ? 'text-white/68' : 'text-slate-600'}`}>Conteudos para clientes, empresas e quem quer aproveitar melhor a internet.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {isLoading ? <div className="mt-8"><Loading /></div> : (
          <div className="motion-stagger grid gap-5 md:grid-cols-3">
            {posts.map((post: any, index: number) => (
              <Link to={`/blog/${post.slug}`} key={post.id} className={index === 0 && template === 'hub' ? 'md:col-span-2' : ''}>
                <Card
                  className={`group h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-soft ${dark ? 'border-white/10 bg-white/[0.07] text-white backdrop-blur' : 'bg-white'}`}
                  style={{ borderColor: dark ? 'rgb(255 255 255 / 0.12)' : alpha(theme.primaryRgb, 0.12) }}
                >
                  <div className={`${index === 0 && template === 'hub' ? 'h-64' : 'h-44'}`} style={{ backgroundColor: alpha(theme.primaryRgb, dark ? 0.18 : 0.08) }}>
                    {post.coverImageUrl ? <img src={assetUrl(post.coverImageUrl)} alt="" className="h-full w-full object-cover transition group-hover:scale-105" /> : null}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase" style={{ color: dark ? theme.secondary : theme.primary }}>{post.category?.name} - {readableDate(post.publishedAt)}</p>
                    <h2 className={`mt-2 font-display text-xl font-bold ${dark ? 'text-white' : 'text-brand-900'}`}>{post.title}</h2>
                    <p className={`mt-2 text-sm leading-6 ${dark ? 'text-white/64' : 'text-slate-600'}`}>{post.summary}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-black" style={{ color: theme.secondary }}>Ler conteudo <ArrowRight size={16} /></span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
