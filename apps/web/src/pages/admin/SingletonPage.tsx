import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { AdminForm, FieldConfig } from '../../components/admin/AdminForm';
import { Loading } from '../../components/ui/Status';

export function SingletonPage({ title, endpoint, fields }: { title: string; endpoint: string; fields: FieldConfig[] }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['singleton', endpoint], queryFn: () => api.get<any>(endpoint) });
  const save = useMutation({
    mutationFn: (values: any) => api.put(endpoint, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['singleton', endpoint] })
  });

  return (
    <section>
      <h1 className="font-display text-3xl font-bold text-brand-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">Essas informações alimentam o site público e o rodapé.</p>
      <div className="mt-6">
        {isLoading ? <Loading /> : (
          <>
            <AdminForm fields={fields} initial={data?.data} onSubmit={async (values) => { await save.mutateAsync(values); }} onCancel={() => undefined} />
            {save.isSuccess ? <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-700">Configurações salvas.</p> : null}
          </>
        )}
      </div>
    </section>
  );
}
