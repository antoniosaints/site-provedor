import { useMutation, useQuery } from '@tanstack/react-query';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { api } from '../../lib/api';
import { buttonStyle, alpha, getSiteTemplate, isDarkTemplate, templateVars, themeFromSettings } from '../../lib/site-theme';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FieldWrap, Input, Select, Textarea } from '../../components/ui/Field';
import { Seo } from '../../components/public/Seo';
import { ThemedLink } from '../../components/public/ThemedLink';
import { whatsappLink } from '../../lib/format';

export function ContactPage() {
  const { data } = useQuery({ queryKey: ['public-settings'], queryFn: () => api.get<any>('/api/public/settings') });
  const { register, handleSubmit, reset, formState } = useForm<any>({ defaultValues: { requestType: 'comercial' } });
  const mutation = useMutation({
    mutationFn: (values: any) => api.post('/api/public/contact', values),
    onSuccess: () => reset()
  });
  const company = data?.company;
  const settings = data?.settings;
  const theme = themeFromSettings(settings);
  const template = getSiteTemplate(settings);
  const dark = isDarkTemplate(template);

  return (
    <main className={dark ? 'bg-slate-950 text-white' : template === 'hub' ? 'bg-[#f4f8fb] text-slate-950' : 'bg-[#f6faff] text-slate-950'} style={templateVars(theme)}>
      <Seo title="Contato | MEGANET" description="Fale com a MEGANET para contratar, tirar duvidas ou solicitar suporte." />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: dark ? `radial-gradient(circle at 20% 16%,${alpha(theme.primaryRgb, 0.42)},transparent 28%),radial-gradient(circle at 86% 8%,${alpha(theme.secondaryRgb, 0.28)},transparent 24%)` : `linear-gradient(120deg,${alpha(theme.primaryRgb, 0.12)},transparent 50%),radial-gradient(circle at 84% 12%,${alpha(theme.secondaryRgb, 0.16)},transparent 26%)` }} />
        <div className="motion-reveal relative mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div className="self-center">
            <p className="font-bold" style={{ color: dark ? theme.secondary : theme.primary }}>Contato</p>
            <h1 className={`mt-2 font-display text-5xl font-black leading-none ${dark ? 'text-white' : 'text-brand-900'}`}>Fale com a equipe {company?.companyName ?? 'MEGANET'}</h1>
            <p className={`mt-5 max-w-xl text-lg leading-8 ${dark ? 'text-white/68' : 'text-slate-600'}`}>Escolha o melhor canal ou envie uma mensagem para o atendimento retornar.</p>
            <div className={`mt-8 grid gap-4 ${dark ? 'text-white/72' : 'text-slate-600'}`}>
              {company?.phone ? <p className="flex gap-3"><Phone style={{ color: theme.secondary }} /> {company.phone}</p> : null}
              {company?.email ? <p className="flex gap-3"><Mail style={{ color: theme.secondary }} /> {company.email}</p> : null}
              {company?.address ? <p className="flex gap-3"><MapPin style={{ color: theme.secondary }} /> {company.address}</p> : null}
              {company?.businessHours ? <p className="font-semibold">{company.businessHours}</p> : null}
            </div>
            <ThemedLink className="mt-8" href={whatsappLink(company?.whatsapp, settings?.whatsappContractMessage)} theme={theme} variant={dark ? 'accent' : 'primary'} external>
              <MessageCircle size={17} /> Falar no WhatsApp
            </ThemedLink>
          </div>

          <Card className={`p-6 ${dark ? 'border-white/10 bg-white/[0.07] text-white backdrop-blur' : 'bg-white'}`} style={{ borderColor: dark ? 'rgb(255 255 255 / 0.12)' : alpha(theme.primaryRgb, 0.12) }}>
            <form className="grid gap-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
              <div className="grid gap-4 md:grid-cols-2">
                <FieldWrap label="Nome"><Input required {...register('name')} /></FieldWrap>
                <FieldWrap label="Telefone/WhatsApp"><Input required {...register('phone')} /></FieldWrap>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FieldWrap label="E-mail"><Input type="email" {...register('email')} /></FieldWrap>
                <FieldWrap label="Tipo de solicitacao">
                  <Select {...register('requestType')}>
                    <option value="contratacao">Contratacao</option>
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
              <Button disabled={formState.isSubmitting || mutation.isPending} style={buttonStyle(theme, dark ? 'accent' : 'primary')}>Enviar mensagem</Button>
            </form>
          </Card>
        </div>
      </section>
    </main>
  );
}
