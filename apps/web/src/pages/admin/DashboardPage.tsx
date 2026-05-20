import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, Home, Image, MessageSquare, Newspaper, Star, Wifi } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Status';

type MonthlyPoint = {
  key: string;
  label: string;
  total: number;
};

type DashboardData = {
  plans: number;
  posts: number;
  banners: number;
  contacts: number;
  coverage: number;
  testimonials: number;
  content?: {
    plans?: { total: number; active: number };
    posts?: { total: number; published: number };
    testimonials?: { total: number; active: number };
  };
  monthly?: {
    contacts?: MonthlyPoint[];
    coverage?: MonthlyPoint[];
  };
};

type MetricKey = keyof Pick<DashboardData, 'plans' | 'posts' | 'banners' | 'contacts' | 'coverage' | 'testimonials'>;

const cards: Array<{ key: MetricKey; title: string; Icon: LucideIcon; href: string }> = [
  { key: 'plans', title: 'Planos cadastrados', Icon: Wifi, href: '/admin/planos' },
  { key: 'posts', title: 'Posts publicados', Icon: Newspaper, href: '/admin/blog/posts' },
  { key: 'banners', title: 'Slides ativos', Icon: Image, href: '/admin/carrossel' },
  { key: 'contacts', title: 'Mensagens novas', Icon: MessageSquare, href: '/admin/contatos' },
  { key: 'coverage', title: 'Solicitações de cobertura', Icon: Home, href: '/admin/cobertura' },
  { key: 'testimonials', title: 'Depoimentos ativos', Icon: Star, href: '/admin/depoimentos' }
];

function MonthlyChart({ contacts, coverage }: { contacts: MonthlyPoint[]; coverage: MonthlyPoint[] }) {
  const rows = (contacts.length ? contacts : coverage).map((item, index) => ({
    label: item.label,
    contacts: contacts[index]?.total ?? 0,
    coverage: coverage[index]?.total ?? 0
  }));
  const max = Math.max(1, ...rows.flatMap((row) => [row.contacts, row.coverage]));

  return (
    <Card className="p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="font-display text-xl font-bold text-brand-900">Atendimentos por mês</h2>
          <p className="mt-1 text-sm text-slate-500">Entradas de contato e consultas de cobertura nos últimos meses.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-500">
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-brand-600" /> Contatos</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-signal" /> Cobertura</span>
        </div>
      </div>

      <div className="mt-6 grid min-h-56 grid-cols-3 items-end gap-3 sm:grid-cols-6">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-2">
            <div className="flex h-44 items-end justify-center gap-1.5 rounded-lg bg-slate-50 px-2 py-3 ring-1 ring-slate-100">
              <div className="w-4 rounded-t-md bg-brand-600" style={{ height: row.contacts ? `${(row.contacts / max) * 100}%` : '0%' }} title={`${row.contacts} contatos`} />
              <div className="w-4 rounded-t-md bg-signal" style={{ height: row.coverage ? `${(row.coverage / max) * 100}%` : '0%' }} title={`${row.coverage} coberturas`} />
            </div>
            <span className="text-center text-[11px] font-bold uppercase text-slate-500">{row.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ContentQuantityChart({ data }: { data?: DashboardData }) {
  const items = [
    {
      label: 'Planos',
      total: data?.content?.plans?.total ?? data?.plans ?? 0,
      detail: `${data?.content?.plans?.active ?? data?.plans ?? 0} ativos`
    },
    {
      label: 'Posts',
      total: data?.content?.posts?.total ?? data?.posts ?? 0,
      detail: `${data?.content?.posts?.published ?? data?.posts ?? 0} publicados`
    },
    {
      label: 'Depoimentos',
      total: data?.content?.testimonials?.total ?? data?.testimonials ?? 0,
      detail: `${data?.content?.testimonials?.active ?? data?.testimonials ?? 0} ativos`
    }
  ];
  const max = Math.max(1, ...items.map((item) => item.total));

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-50 text-brand-700">
          <BarChart3 size={22} />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-brand-900">Conteúdo do site</h2>
          <p className="mt-1 text-sm text-slate-500">Quantidades gerais para planos, posts e depoimentos.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5">
        {items.map((item) => (
          <div key={item.label} className="grid gap-2">
            <div className="flex items-center justify-between gap-3 text-sm font-bold">
              <span className="text-slate-700">{item.label}</span>
              <span className="tabular-nums text-brand-900">{item.total}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand-600" style={{ width: `${(item.total / max) * 100}%` }} />
            </div>
            <p className="text-xs font-semibold text-slate-500">{item.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => api.get<DashboardData>('/api/admin/dashboard') });

  return (
    <section>
      <h1 className="font-display text-3xl font-bold text-brand-900">Dashboard</h1>
      <p className="mt-2 text-slate-500">Resumo rápido do conteúdo e dos atendimentos recebidos.</p>
      {isLoading ? <div className="mt-6"><Loading /></div> : (
        <div className="mt-6 grid gap-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map(({ key, title, Icon, href }) => (
              <Link to={href} key={key}>
                <Card className="p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
                  <Icon className="text-brand-600" />
                  <p className="mt-5 text-3xl font-extrabold text-brand-900">{data?.[key] ?? 0}</p>
                  <p className="text-sm font-bold text-slate-500">{title}</p>
                </Card>
              </Link>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <MonthlyChart contacts={data?.monthly?.contacts ?? []} coverage={data?.monthly?.coverage ?? []} />
            <ContentQuantityChart data={data} />
          </div>
        </div>
      )}
    </section>
  );
}
