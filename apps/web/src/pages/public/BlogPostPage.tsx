import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { api, assetUrl } from '../../lib/api';
import { readableDate } from '../../lib/format';
import { alpha, getSiteTemplate, isDarkTemplate, templateVars, themeFromSettings } from '../../lib/site-theme';
import { Loading } from '../../components/ui/Status';
import { Seo } from '../../components/public/Seo';

export function BlogPostPage() {
  const { slug } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ['post', slug], queryFn: () => api.get<any>(`/api/public/blog/posts/${slug}`), enabled: Boolean(slug) });
  const settings = useQuery({ queryKey: ['public-settings'], queryFn: () => api.get<any>('/api/public/settings') });
  const post = data?.data;
  const siteSettings = settings.data?.settings;
  const theme = themeFromSettings(siteSettings);
  const template = getSiteTemplate(siteSettings);
  const dark = isDarkTemplate(template);

  if (isLoading) return <main className="mx-auto max-w-3xl px-4 py-12"><Loading /></main>;

  return (
    <main className={dark ? 'bg-slate-950 text-white' : template === 'hub' ? 'bg-[#f4f8fb] text-slate-950' : 'bg-[#f6faff] text-slate-950'} style={templateVars(theme)}>
      <Seo title={post?.seoTitle ?? post?.title ?? 'Blog | MEGANET'} description={post?.seoDescription ?? post?.summary} />
      <article className="motion-reveal mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: dark ? theme.secondary : theme.primary }}><ArrowLeft size={16} /> Voltar ao blog</Link>
        <p className="mt-8 text-sm font-bold uppercase" style={{ color: dark ? theme.secondary : theme.primary }}>{post?.category?.name} - {readableDate(post?.publishedAt)}</p>
        <h1 className={`mt-3 font-display text-4xl font-black leading-tight ${dark ? 'text-white' : 'text-brand-900'}`}>{post?.title}</h1>
        <p className={`mt-4 text-lg leading-8 ${dark ? 'text-white/68' : 'text-slate-600'}`}>{post?.summary}</p>
        {post?.coverImageUrl ? <img src={assetUrl(post.coverImageUrl)} alt="" className="mt-8 aspect-video w-full rounded-lg object-cover shadow-soft" /> : null}
        <div className={`mt-8 rounded-lg p-6 ${dark ? 'bg-white/[0.07] ring-1 ring-white/10' : 'bg-white shadow-sm ring-1 ring-slate-200'}`} style={{ boxShadow: dark ? `0 22px 70px ${alpha(theme.primaryRgb, 0.16)}` : undefined }}>
          <div className={`prose-meganet max-w-none text-lg leading-8 ${dark ? 'text-white/76' : 'text-slate-700'}`} dangerouslySetInnerHTML={{ __html: post?.content ?? '' }} />
        </div>
      </article>
    </main>
  );
}
