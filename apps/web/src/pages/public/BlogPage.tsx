import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, assetUrl } from '../../lib/api';
import { readableDate } from '../../lib/format';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Status';
import { Seo } from '../../components/public/Seo';

export function BlogPage() {
  const { data, isLoading } = useQuery({ queryKey: ['blog'], queryFn: () => api.get<any>('/api/public/blog/posts') });
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Seo title="Blog | MEGANET" description="Dicas de internet, Wi-Fi, segurança digital e tecnologia." />
      <div className="motion-reveal">
        <p className="font-bold text-brand-700">Blog</p>
        <h1 className="font-display text-4xl font-bold text-brand-900">Dicas e novidades para ficar melhor conectado</h1>
      </div>
      {isLoading ? <div className="mt-8"><Loading /></div> : (
        <div className="motion-stagger mt-8 grid gap-5 md:grid-cols-3">
          {data?.data?.map((post: any) => (
            <Link to={`/blog/${post.slug}`} key={post.id}>
              <Card className="h-full overflow-hidden">
                <div className="h-44 bg-brand-50">{post.coverImageUrl ? <img src={assetUrl(post.coverImageUrl)} alt="" className="h-full w-full object-cover" /> : null}</div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase text-brand-700">{post.category?.name} · {readableDate(post.publishedAt)}</p>
                  <h2 className="mt-2 font-display text-xl font-bold text-brand-900">{post.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{post.summary}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
