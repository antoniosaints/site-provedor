import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FieldWrap, Input, Textarea } from '../../components/ui/Field';
import { Seo } from '../../components/public/Seo';

export function CoveragePage() {
  const plans = useQuery({ queryKey: ['plans', 'coverage'], queryFn: () => api.get<any>('/api/public/plans') });
  const { register, handleSubmit, reset } = useForm();
  const mutation = useMutation({
    mutationFn: (values: any) => api.post('/api/public/coverage', values),
    onSuccess: () => reset()
  });

  return (
    <main className="motion-reveal mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Seo title="Consultar cobertura | MEGANET" description="Envie seus dados para a MEGANET verificar disponibilidade de internet no seu endereço." />
      <p className="font-bold text-brand-700">Cobertura</p>
      <h1 className="font-display text-4xl font-bold text-brand-900">Consulte disponibilidade no seu endereço</h1>
      <p className="mt-4 text-lg leading-8 text-slate-600">Preencha os dados e nossa equipe retornará pelo WhatsApp com a disponibilidade e as melhores opções.</p>
      <Card className="mt-8 p-6">
        <form className="grid gap-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <div className="grid gap-4 md:grid-cols-2">
            <FieldWrap label="Nome"><Input required {...register('name')} /></FieldWrap>
            <FieldWrap label="Telefone/WhatsApp"><Input required {...register('phone')} /></FieldWrap>
          </div>
          <FieldWrap label="Endereço"><Input required {...register('address')} /></FieldWrap>
          <div className="grid gap-4 md:grid-cols-2">
            <FieldWrap label="Bairro"><Input required {...register('neighborhood')} /></FieldWrap>
            <FieldWrap label="Cidade"><Input required {...register('city')} /></FieldWrap>
          </div>
          <FieldWrap label="Plano de interesse">
            <select className="h-11 rounded-lg border-slate-200 text-sm" {...register('planInterest')}>
              <option value="">Ainda não sei</option>
              {plans.data?.data?.map((plan: any) => <option key={plan.id} value={plan.name}>{plan.name}</option>)}
            </select>
          </FieldWrap>
          <FieldWrap label="Referência"><Textarea {...register('reference')} /></FieldWrap>
          {mutation.isSuccess ? <p className="rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-700">Solicitação registrada com sucesso.</p> : null}
          {mutation.isError ? <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{mutation.error.message}</p> : null}
          <Button disabled={mutation.isPending}>Enviar consulta</Button>
        </form>
      </Card>
    </main>
  );
}
