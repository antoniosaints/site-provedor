import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock } from 'lucide-react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FieldWrap, Input } from '../../components/ui/Field';
import { Logo } from '../../components/public/Logo';

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit } = useForm({ defaultValues: { email: 'admin@meganet.com.br', password: 'admin123' } });
  const mutation = useMutation({
    mutationFn: (values: any) => api.post('/api/auth/login', values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate('/admin');
    }
  });

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#eef8ff,#ffffff)] px-4">
      <Card className="w-full max-w-md p-6">
        <Logo />
        <div className="mt-8">
          <h1 className="font-display text-2xl font-bold text-brand-900">Acesso administrativo</h1>
          <p className="mt-2 text-sm text-slate-500">Entre para gerenciar o conteúdo do site MEGANET.</p>
        </div>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <FieldWrap label="E-mail"><Input type="email" required {...register('email')} /></FieldWrap>
          <FieldWrap label="Senha"><Input type="password" required {...register('password')} /></FieldWrap>
          {mutation.isError ? <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{mutation.error.message}</p> : null}
          <Button disabled={mutation.isPending}><Lock size={17} /> Entrar</Button>
        </form>
      </Card>
    </main>
  );
}
