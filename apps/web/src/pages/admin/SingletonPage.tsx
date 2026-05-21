import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit } from 'lucide-react';
import { api } from '../../lib/api';
import { AdminForm, FieldConfig } from '../../components/admin/AdminForm';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Loading } from '../../components/ui/Status';

export function SingletonPage({ title, endpoint, fields }: { title: string; endpoint: string; fields: FieldConfig[] }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['singleton', endpoint], queryFn: () => api.get<any>(endpoint) });
  const save = useMutation({
    mutationFn: (values: any) => api.put(endpoint, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['singleton', endpoint] });
      if (endpoint === '/api/admin/settings') {
        await queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      }
    }
  });

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">Essas informacoes alimentam o site publico e o rodape.</p>
        </div>
        <Button type="button" onClick={() => setOpen(true)} disabled={isLoading}><Edit size={17} /> Editar</Button>
      </div>

      <div className="mt-6">
        {isLoading ? <Loading /> : (
          <>
            <Card motion={false} className="p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="font-display text-xl font-bold text-brand-900">Dados cadastrados</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Abra o modal para revisar e editar essas informacoes com mais espaco.</p>
                </div>
                <Button type="button" variant="secondary" onClick={() => setOpen(true)}><Edit size={16} /> Editar informacoes</Button>
              </div>
            </Card>
            {save.isSuccess ? <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-700">Configuracoes salvas.</p> : null}
          </>
        )}
      </div>

      <Modal open={open && !isLoading} title={title} description="Edite os campos e salve para atualizar o site." size="xl" onClose={() => setOpen(false)}>
        <AdminForm
          fields={fields}
          initial={data?.data}
          onSubmit={async (values) => {
            await save.mutateAsync(values);
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </section>
  );
}
