import { useMutation, useQuery } from '@tanstack/react-query';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { api } from '../../lib/api';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FieldWrap, Input, Select, Textarea } from '../../components/ui/Field';
import { Seo } from '../../components/public/Seo';
import { whatsappLink } from '../../lib/format';

export function ContactPage() {
  const { data } = useQuery({ queryKey: ['public-settings'], queryFn: () => api.get<any>('/api/public/settings') });
  const { register, handleSubmit, reset, formState } = useForm<any>({ defaultValues: { requestType: 'comercial' } });
  const mutation = useMutation({
    mutationFn: (values: any) => api.post('/api/public/contact', values),
    onSuccess: () => reset()
  });
  const company = data?.company;

  return (
    <main className="motion-reveal mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
      <Seo title="Contato | MEGANET" description="Fale com a MEGANET para contratar, tirar dúvidas ou solicitar suporte." />
      <div>
        <p className="font-bold text-brand-700">Contato</p>
        <h1 className="font-display text-4xl font-bold text-brand-900">Fale com a equipe MEGANET</h1>
        <div className="mt-8 grid gap-4 text-slate-600">
          {company?.phone ? <p className="flex gap-3"><Phone className="text-brand-600" /> {company.phone}</p> : null}
          {company?.email ? <p className="flex gap-3"><Mail className="text-brand-600" /> {company.email}</p> : null}
          {company?.address ? <p className="flex gap-3"><MapPin className="text-brand-600" /> {company.address}</p> : null}
          {company?.businessHours ? <p className="font-semibold">{company.businessHours}</p> : null}
        </div>
        <ButtonLink className="mt-8" href={whatsappLink(company?.whatsapp, data?.settings?.whatsappContractMessage)} target="_blank" rel="noreferrer">Falar no WhatsApp</ButtonLink>
      </div>
      <Card className="p-6">
        <form className="grid gap-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <div className="grid gap-4 md:grid-cols-2">
            <FieldWrap label="Nome"><Input required {...register('name')} /></FieldWrap>
            <FieldWrap label="Telefone/WhatsApp"><Input required {...register('phone')} /></FieldWrap>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FieldWrap label="E-mail"><Input type="email" {...register('email')} /></FieldWrap>
            <FieldWrap label="Tipo de solicitação">
              <Select {...register('requestType')}>
                <option value="contratacao">Contratação</option>
                <option value="suporte">Suporte</option>
                <option value="financeiro">Financeiro</option>
                <option value="comercial">Comercial</option>
                <option value="outro">Outro</option>
              </Select>
            </FieldWrap>
          </div>
          <FieldWrap label="Assunto"><Input {...register('subject')} /></FieldWrap>
          <FieldWrap label="Mensagem"><Textarea required {...register('message')} /></FieldWrap>
          {mutation.isSuccess ? <p className="rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-700">Mensagem enviada com sucesso.</p> : null}
          {mutation.isError ? <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{mutation.error.message}</p> : null}
          <Button disabled={formState.isSubmitting || mutation.isPending}>Enviar mensagem</Button>
        </form>
      </Card>
    </main>
  );
}
