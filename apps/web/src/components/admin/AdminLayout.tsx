import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, FileText, Home, Image, LayoutDashboard, LogOut, MessageSquare, PackagePlus, Settings, Sparkles, Star, Users, Wifi } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Logo } from '../public/Logo';

const links = [
  { to: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/admin/carrossel', label: 'Carrossel', Icon: Image },
  { to: '/admin/destaques', label: 'Destaques', Icon: Sparkles },
  { to: '/admin/complementos', label: 'Complementos', Icon: PackagePlus },
  { to: '/admin/planos', label: 'Planos', Icon: Wifi },
  { to: '/admin/blog/posts', label: 'Posts', Icon: FileText },
  { to: '/admin/blog/categorias', label: 'Categorias', Icon: BarChart3 },
  { to: '/admin/depoimentos', label: 'Depoimentos', Icon: Star },
  { to: '/admin/contatos', label: 'Contatos', Icon: MessageSquare },
  { to: '/admin/cobertura', label: 'Cobertura', Icon: Home },
  { to: '/admin/sobre', label: 'Sobre', Icon: Users },
  { to: '/admin/redes-sociais', label: 'Redes sociais', Icon: Users },
  { to: '/admin/configuracoes', label: 'Configurações', Icon: Settings }
];

export function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function logout() {
    await api.post('/api/auth/logout');
    queryClient.clear();
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-r border-slate-200 bg-white p-4 lg:min-h-screen">
        <div className="mb-6"><Logo compact /></div>
        <nav className="grid gap-1">
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="mt-6 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
          <LogOut size={18} /> Sair
        </button>
      </aside>
      <main className="min-w-0 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
