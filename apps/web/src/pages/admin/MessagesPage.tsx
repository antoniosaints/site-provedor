import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Trash2 } from 'lucide-react';
import { api, ApiList } from '../../lib/api';
import { whatsappLink, readableDate } from '../../lib/format';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState, Loading } from '../../components/ui/Status';

export function MessagesPage({ title, endpoint, type }: { title: string; endpoint: string; type: 'contact' | 'coverage' }) {
  const queryClient = useQueryClient();
  const queryKey = ['messages', endpoint];
  const { data, isLoading } = useQuery({ queryKey, queryFn: () => api.get<ApiList<any>>(endpoint) });
  const patch = useMutation({
    mutationFn: ({ id, values }: { id: string; values: any }) => api.patch(`${endpoint}/${id}`, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`${endpoint}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });

  return (
    <section>
      <h1 className="font-display text-3xl font-bold text-brand-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">Acompanhe solicitações, altere status e abra atendimento pelo WhatsApp.</p>
      <Card className="mt-6 overflow-hidden">
        {isLoading ? <Loading /> : !data?.data?.length ? <EmptyState title="Nenhum atendimento recebido" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Dados</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-slate-500">{item.phone}</p>
                    </td>
                    <td className="max-w-md px-4 py-3 text-slate-600">
                      {type === 'contact' ? (
                        <>{item.requestType} · {item.subject}<br />{item.message}</>
                      ) : (
                        <>{item.address}, {item.neighborhood}, {item.city}<br />{item.planInterest}</>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select className="rounded-lg border-slate-200 text-sm" value={item.status} onChange={(e) => patch.mutate({ id: item.id, values: { status: e.target.value, read: true } })}>
                        <option value="novo">Novo</option>
                        <option value="em_andamento">Em andamento</option>
                        <option value="respondido">Respondido</option>
                        <option value="arquivado">Arquivado</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{readableDate(item.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <ButtonLink className="h-9 px-3" variant="secondary" href={whatsappLink(item.phone, `Olá, ${item.name}! Somos da MEGANET.`)} target="_blank" rel="noreferrer"><ExternalLink size={15} /></ButtonLink>
                        <Button className="h-9 px-3" variant="danger" onClick={() => remove.mutate(item.id)}><Trash2 size={15} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}
