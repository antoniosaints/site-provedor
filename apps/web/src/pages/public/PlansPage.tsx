import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../lib/api';
import { PlanCard } from '../../components/public/PlanCard';
import { Seo } from '../../components/public/Seo';
import { Select } from '../../components/ui/Field';
import { Loading } from '../../components/ui/Status';

export function PlansPage() {
  const [sort, setSort] = useState('featured');
  const [type, setType] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['plans', sort, type], queryFn: () => api.get<any>(`/api/public/plans?sort=${sort}${type ? `&type=${type}` : ''}`) });
  const settings = useQuery({ queryKey: ['public-settings'], queryFn: () => api.get<any>('/api/public/settings') });

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Seo title="Planos de internet | MEGANET" description="Conheça os planos residenciais, empresariais e dedicados da MEGANET." />
      <div className="motion-reveal flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-bold text-brand-700">Planos</p>
          <h1 className="font-display text-4xl font-bold text-brand-900">Internet para cada tipo de uso</h1>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Todos os tipos</option>
            <option value="residencial">Residencial</option>
            <option value="empresarial">Empresarial</option>
            <option value="dedicado">Dedicado</option>
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Destaque</option>
            <option value="price">Menor preço</option>
            <option value="speed">Maior velocidade</option>
          </Select>
        </div>
      </div>
      {isLoading ? <div className="mt-8"><Loading /></div> : (
        <div className="motion-stagger mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data?.data?.map((plan: any) => <PlanCard key={plan.id} plan={plan} whatsapp={settings.data?.company?.whatsapp} message={settings.data?.settings?.whatsappContractMessage} />)}
        </div>
      )}
    </main>
  );
}
