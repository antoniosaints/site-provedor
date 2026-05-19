import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, assetUrl } from '../../lib/api';
import { readableDate } from '../../lib/format';
import { Loading } from '../../components/ui/Status';
import { Seo } from '../../components/public/Seo';

export function BlogPostPage() {
  const { slug } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ['post', slug], queryFn: () => api.get<any>(`/api/public/blog/posts/${slug}`), enabled: Boolean(slug) });
  const post = data?.data;
  if (isLoading) return <main className="mx-auto max-w-3xl px-4 py-12"><Loading /></main>;

  return (
    <main className="motion-reveal mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Seo title={post?.seoTitle ?? post?.title ?? 'Blog | MEGANET'} description={post?.seoDescription ?? post?.summary} />
      <Link to="/blog" className="text-sm font-bold text-brand-700">Voltar ao blog</Link>
      <p className="mt-8 text-sm font-bold uppercase text-brand-700">{post?.category?.name} · {readableDate(post?.publishedAt)}</p>
      <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-brand-900">{post?.title}</h1>
      <p className="mt-4 text-lg leading-8 text-slate-600">{post?.summary}</p>
      {post?.coverImageUrl ? <img src={assetUrl(post.coverImageUrl)} alt="" className="mt-8 aspect-video w-full rounded-lg object-cover shadow-soft" /> : null}
      <article className="prose-meganet mt-8 max-w-none text-lg leading-8 text-slate-700" dangerouslySetInnerHTML={{ __html: post?.content ?? '' }} />
    </main>
  );
}
