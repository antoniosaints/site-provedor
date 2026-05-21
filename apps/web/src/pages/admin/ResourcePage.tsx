import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { api, ApiList } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { EmptyState, Loading } from '../../components/ui/Status';
import { AdminForm, FieldConfig } from '../../components/admin/AdminForm';

type Props = {
  title: string;
  endpoint: string;
  fields: FieldConfig[] | ((editing: any | null, creating: boolean) => FieldConfig[]);
  columns: { key: string; label: string; render?: (item: any) => React.ReactNode }[];
};

export function ResourcePage({ title, endpoint, fields, columns }: Props) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const queryKey = useMemo(() => ['admin-resource', endpoint], [endpoint]);
  const formOpen = creating || Boolean(editing);
  const activeFields = useMemo(() => typeof fields === 'function' ? fields(editing, creating) : fields, [creating, editing, fields]);
  const { data, isLoading } = useQuery({ queryKey, queryFn: () => api.get<ApiList<any>>(endpoint) });
  const save = useMutation({
    mutationFn: (values: any) => editing ? api.put(`${endpoint}/${editing.id}`, values) : api.post(endpoint, values),
    onSuccess: async () => {
      setEditing(null);
      setCreating(false);
      await queryClient.invalidateQueries({ queryKey });
    }
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`${endpoint}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });
  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">Crie, edite, ative e organize os registros exibidos no site.</p>
        </div>
        <Button onClick={() => { setEditing(null); setCreating(true); }}><Plus size={17} /> Novo</Button>
      </div>

      <Modal
        open={formOpen}
        title={editing ? `Editar ${title}` : `Novo ${title}`}
        description="Preencha os campos e salve para atualizar o site."
        size="xl"
        onClose={closeForm}
      >
        {formOpen ? (
          <AdminForm
            fields={activeFields}
            initial={editing}
            onCancel={closeForm}
            onSubmit={async (values) => { await save.mutateAsync(values); }}
          />
        ) : null}
      </Modal>

      <Card className="mt-6 overflow-hidden">
        {isLoading ? <Loading /> : !data?.data?.length ? <EmptyState title="Nenhum registro encontrado" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  {columns.map((column) => <th key={column.key} className="px-4 py-3">{column.label}</th>)}
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((item) => (
                  <tr key={item.id}>
                    {columns.map((column) => <td key={column.key} className="px-4 py-3">{column.render ? column.render(item) : String(item[column.key] ?? '')}</td>)}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" className="h-9 px-3" onClick={() => { setCreating(false); setEditing(item); }}><Edit size={15} /></Button>
                        <Button type="button" variant="danger" className="h-9 px-3" onClick={() => window.confirm('Excluir este registro?') ? remove.mutate(item.id) : undefined}><Trash2 size={15} /></Button>
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
