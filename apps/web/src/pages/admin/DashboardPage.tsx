import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Image, MessageSquare, Newspaper, Star, Wifi } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Status';

const cards = [
  ['plans', 'Planos cadastrados', Wifi, '/admin/planos'],
  ['posts', 'Posts publicados', Newspaper, '/admin/blog/posts'],
  ['banners', 'Slides ativos', Image, '/admin/carrossel'],
  ['contacts', 'Mensagens novas', MessageSquare, '/admin/contatos'],
  ['coverage', 'Solicitações de cobertura', MessageSquare, '/admin/cobertura'],
  ['testimonials', 'Depoimentos ativos', Star, '/admin/depoimentos']
];

export function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => api.get<any>('/api/admin/dashboard') });
  return (
    <section>
      <h1 className="font-display text-3xl font-bold text-brand-900">Dashboard</h1>
      <p className="mt-2 text-slate-500">Resumo rápido do conteúdo e dos atendimentos recebidos.</p>
      {isLoading ? <div className="mt-6"><Loading /></div> : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map(([key, title, Icon, href]) => (
            <Link to={href as string} key={key as string}>
              <Card className="p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
                <Icon className="text-brand-600" />
                <p className="mt-5 text-3xl font-extrabold text-brand-900">{data?.[key as string] ?? 0}</p>
                <p className="text-sm font-bold text-slate-500">{title as string}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
