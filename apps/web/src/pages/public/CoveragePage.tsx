import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { MapPinned } from 'lucide-react';
import { api } from '../../lib/api';
import { alpha, buttonStyle, getSiteTemplate, isDarkTemplate, templateVars, themeFromSettings } from '../../lib/site-theme';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FieldWrap, Input, Textarea } from '../../components/ui/Field';
import { Seo } from '../../components/public/Seo';

export function CoveragePage() {
  const plans = useQuery({ queryKey: ['plans', 'coverage'], queryFn: () => api.get<any>('/api/public/plans') });
  const settings = useQuery({ queryKey: ['public-settings'], queryFn: () => api.get<any>('/api/public/settings') });
  const { register, handleSubmit, reset } = useForm();
  const mutation = useMutation({
    mutationFn: (values: any) => api.post('/api/public/coverage', values),
    onSuccess: () => reset()
  });
  const siteSettings = settings.data?.settings;
  const theme = themeFromSettings(siteSettings);
  const template = getSiteTemplate(siteSettings);
  const dark = isDarkTemplate(template);

  return (
    <main className={dark ? 'bg-slate-950 text-white' : template === 'hub' ? 'bg-[#f4f8fb] text-slate-950' : 'bg-[#f6faff] text-slate-950'} style={templateVars(theme)}>
      <Seo title="Consultar cobertura | MEGANET" description="Envie seus dados para a MEGANET verificar disponibilidade de internet no seu endereco." />
      <section className="motion-reveal relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: dark ? `radial-gradient(circle at 20% 16%,${alpha(theme.primaryRgb, 0.42)},transparent 28%),radial-gradient(circle at 86% 8%,${alpha(theme.secondaryRgb, 0.28)},transparent 24%)` : `linear-gradient(120deg,${alpha(theme.primaryRgb, 0.12)},transparent 50%),radial-gradient(circle at 84% 12%,${alpha(theme.secondaryRgb, 0.16)},transparent 26%)` }} />
        <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-black uppercase tracking-[0.16em]" style={{ backgroundColor: dark ? 'rgb(255 255 255 / 0.08)' : alpha(theme.primaryRgb, 0.1), color: dark ? theme.secondary : theme.primary }}>
            <MapPinned size={15} /> Cobertura
          </span>
          <h1 className={`mt-5 font-display text-4xl font-black ${dark ? 'text-white' : 'text-brand-900'}`}>Consulte disponibilidade no seu endereco</h1>
          <p className={`mt-4 text-lg leading-8 ${dark ? 'text-white/68' : 'text-slate-600'}`}>Preencha os dados e nossa equipe retornara pelo WhatsApp com a disponibilidade e as melhores opcoes.</p>

          <Card className={`mt-8 p-6 ${dark ? 'border-white/10 bg-white/[0.07] text-white backdrop-blur' : 'bg-white'}`} style={{ borderColor: dark ? 'rgb(255 255 255 / 0.12)' : alpha(theme.primaryRgb, 0.12) }}>
            <form className="grid gap-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
              <div className="grid gap-4 md:grid-cols-2">
                <FieldWrap label="Nome"><Input required {...register('name')} /></FieldWrap>
                <FieldWrap label="Telefone/WhatsApp"><Input required {...register('phone')} /></FieldWrap>
              </div>
              <FieldWrap label="Endereco"><Input required {...register('address')} /></FieldWrap>
              <div className="grid gap-4 md:grid-cols-2">
                <FieldWrap label="Bairro"><Input required {...register('neighborhood')} /></FieldWrap>
                <FieldWrap label="Cidade"><Input required {...register('city')} /></FieldWrap>
              </div>
              <FieldWrap label="Plano de interesse">
                <select className="h-11 rounded-lg border-slate-200 bg-white text-sm text-slate-900" {...register('planInterest')}>
                  <option value="">Ainda nao sei</option>
                  {plans.data?.data?.map((plan: any) => <option key={plan.id} value={plan.name}>{plan.name}</option>)}
                </select>
              </FieldWrap>
              <FieldWrap label="Referencia"><Textarea {...register('reference')} /></FieldWrap>
              {mutation.isSuccess ? <p className="rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-700">Solicitacao registrada com sucesso.</p> : null}
              {mutation.isError ? <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{mutation.error.message}</p> : null}
              <Button disabled={mutation.isPending} style={buttonStyle(theme, dark ? 'accent' : 'primary')}>Enviar consulta</Button>
            </form>
          </Card>
        </div>
      </section>
    </main>
  );
}
